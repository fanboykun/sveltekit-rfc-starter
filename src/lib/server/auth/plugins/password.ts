import { compare, hash } from 'bcryptjs';
import { deepMerge } from '../core';
import { Models } from '$lib/server/db/models';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { resend } from '$lib/server/integrations/email/resend';

export class PasswordPlugin {
	private options: { readonly saltRounds: number };
	constructor(options?: { readonly saltRounds?: number }) {
		this.options = deepMerge(
			PasswordPlugin.getHashingOptions(),
			(options as Record<string, unknown>) ?? {}!
		) as { readonly saltRounds: number };
	}

	static getHashingOptions() {
		return {
			saltRounds: 12
		};
	}

	static async hash(password: string) {
		return await hash(password, this.getHashingOptions().saltRounds);
	}

	static async compare(password: string, hash: string) {
		return await compare(password, hash);
	}

	async login(identifier: string, password: string) {
		const user = await new Models.User().findByEmail(identifier);
		if (!user) return { success: false as const, error: 'User not found' };
		if (!user.password) return { success: false as const, error: 'User password does not match' };
		const match = await PasswordPlugin.compare(password, user.password);
		if (!match) return { success: false as const, error: 'Invalid password' };
		return {
			success: true as const,
			data: {
				user: {
					id: user.id,
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
					name: user.name,
					email: user.email,
					picture: user.image || ''
				},
				state: ''
			}
		};
	}

	async register({
		email,
		password,
		name,
		cookies,
		url
	}: {
		email: string;
		password: string;
		name: string;
		cookies: Cookies;
		url: URL;
	}) {
		const user = await new Models.User().findByEmail(email);
		if (user) return { success: false as const, error: 'User already exists' };
		const hashed = await PasswordPlugin.hash(password);
		const createdUser = await new Models.User().create({
			email: email,
			accessToken: null,
			refreshToken: null,
			password: hashed,
			name: name,
			provider: 'password'
		});
		if (!createdUser)
			return {
				success: false as const,
				error: 'Failed to create user'
			};

		const verification = await this.createVerfication({
			cookies,
			email,
			userId: createdUser.id
		});
		if (!verification) return { success: false as const, error: 'Failed to create verification' };
		const verificationLink = `${url.origin}/auth/verify?token=${verification.token}`;
		const sendEmailVerificationResult = await this.sendVerificationEmail({
			email,
			link: verificationLink
		});
		if (!sendEmailVerificationResult.success)
			return { success: false as const, error: 'Failed to send verification email' };

		return {
			success: true as const,
			data: {
				user: {
					id: createdUser.id,
					accessToken: createdUser.accessToken,
					refreshToken: createdUser.refreshToken,
					name: createdUser.name,
					email: createdUser.email,
					picture: createdUser.image || ''
				},
				verification: {
					token: verification.token,
					expiration: verification.expiresAt,
					link: verificationLink
				},
				state: ''
			}
		};
	}

	async createVerfication({
		cookies,
		email,
		userId
	}: {
		cookies: Cookies;
		email: string;
		userId: string;
	}) {
		const now = new Date();
		const FiveMinutesFromNow = new Date(now.setMinutes(6));
		const token = await hash(crypto.randomUUID(), this.options.saltRounds);
		cookies.set('verification', email, {
			httpOnly: true,
			secure: true,
			path: '/',
			expires: FiveMinutesFromNow,
			sameSite: 'strict'
		});
		const [created] = await db
			.insert(schema.verifications)
			.values({
				email,
				expiresAt: FiveMinutesFromNow,
				token,
				userId
			})
			.returning();
		return created;
	}

	async refreshVerificationEmail({
		url,
		email,
		userId,
		cookies
	}: {
		url: URL;
		cookies: Cookies;
		email: string;
		userId: string;
	}) {
		const [currentVerification] = await db
			.select()
			.from(schema.verifications)
			.where(eq(schema.verifications.email, email))
			.limit(1);
		if (currentVerification) {
			if (currentVerification.userId !== userId)
				return { success: false as const, error: 'Verification failed' };

			// check is expired
			if (currentVerification.expiresAt < new Date()) {
				return { success: false as const, error: 'Old Verification Still Exists' };
			}
			await db
				.delete(schema.verifications)
				.where(eq(schema.verifications.token, currentVerification.token));
		}

		const verification = await this.createVerfication({ cookies, email, userId });

		const verificationLink = `${url.origin}/auth/verify?token=${verification.token}`;
		const sendEmailVerificationResult = await this.sendVerificationEmail({
			email,
			link: verificationLink
		});
		if (!sendEmailVerificationResult.success)
			return { success: false as const, error: 'Failed to send verification email' };
		return {
			success: true as const,
			data: {
				verification: {
					token: verification.token,
					expiration: verification.expiresAt,
					link: verificationLink
				}
			}
		};
	}

	async verify({ cookies, token }: { cookies: Cookies; token: string }) {
		const email = cookies.get('verification');
		if (!email) return { success: false as const, error: 'Verification failed' };
		const [verification] = await db
			.select()
			.from(schema.verifications)
			.where(eq(schema.verifications.token, token))
			.limit(1);
		if (!verification) return { success: false as const, error: 'Verification failed' };
		if (verification.email !== email)
			return { success: false as const, error: 'Verification failed' };
		if (verification.expiresAt < new Date())
			return { success: false as const, error: 'Verification failed' };
		await db.delete(schema.verifications).where(eq(schema.verifications.token, token));
		cookies.delete('verification', { path: '/' });
		await db
			.update(schema.users)
			.set({ emailVerifiedAt: new Date() })
			.where(eq(schema.users.id, verification.userId));
		return { success: true as const, data: { user: { id: verification.userId } } };
	}

	async sendVerificationEmail({
		email,
		link,
		from = 'Acme <onboarding@resend.dev>'
	}: {
		from?: string;
		email: string;
		link: string;
	}) {
		const { error } = await resend.emails.send({
			from,
			to: [email],
			subject: 'Verify your email address',
			html: `
					<h2>Verify your account</h2>
					<p>Click the link below to verify your email:</p>
					<a href="${link}">${link}</a>
					<p>This link will expire in 15 minutes.</p>
					`
		});
		if (error) return { success: false as const, error };
		return { success: true as const, data: {} };
	}
}
