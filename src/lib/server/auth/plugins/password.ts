import { compare, hash } from 'bcryptjs';
import { deepMerge } from '../core';
import { Models } from '$lib/server/db/models';

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

	async register(identifier: string, password: string) {
		const user = await new Models.User().findByEmail(identifier);
		if (user) return { success: false as const, error: 'User already exists' };
		const hashed = await PasswordPlugin.hash(password);
		const createdUser = await new Models.User().create({
			email: identifier,
			accessToken: hashed,
			refreshToken: null,
			name: identifier,
			provider: 'password'
		});
		if (!createdUser)
			return {
				success: false as const,
				error: 'Failed to create user'
			};
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
				state: ''
			}
		};
	}
}
