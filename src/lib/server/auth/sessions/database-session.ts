import type { Cookies } from '@sveltejs/kit';
import { type SessionManager, type SessionPayload, type AuthConfig, BaseSession } from '../core';
import { db } from '$lib/server/db';
import { sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * This is an example of a session manager that uses Database to store session data.
 * You can add any other session manager you want using any other storage like db, file, etc.
 * Make sure to extends to `BaseSession` and implements `SessionManager`.
 */
export class DatabaseSession extends BaseSession implements SessionManager {
	constructor(config: AuthConfig) {
		super(config);
	}

	async setSession({
		cookies,
		sessionId,
		data
	}: {
		cookies: Cookies;
		sessionId?: string;
		data: SessionPayload;
	}) {
		try {
			sessionId ??= this.generateSessionId();
			const expiresAt = new Date(Date.now() + this.config.sessionLifetime * 1000);
			const createdSession = await db
				.insert(sessions)
				.values({
					id: sessionId,
					userId: data.userId,
					ipAddress: data.ipAddress,
					userAgent: data.userAgent,
					expiresAt
				})
				.returning();
			if (!createdSession) return false;
			this.setCookie(cookies, sessionId);
			return true;
		} catch (error) {
			console.error('ERROR IN Session.setSession');
			console.error(error);
			return false;
		}
	}

	async getSession<T extends SessionPayload = SessionPayload>({
		cookies
	}: {
		cookies: Cookies;
	}): Promise<T | null> {
		try {
			const sessionId = this.getCookie(cookies);
			if (!sessionId) return null;
			const session = await db.query.sessions.findFirst({
				where: (cols, { eq }) => eq(cols.id, sessionId)
				// with: { user: true }
			});
			if (!session) return null;
			if (session.expiresAt < new Date()) {
				await this.deleteSession({ cookies });
				return null;
			}
			return {
				userId: session.userId,
				ipAddress: session.ipAddress,
				userAgent: session.userAgent
			} as unknown as T;
		} catch (error) {
			console.error('ERROR IN Session.getSession');
			console.error(error);
			return null;
		}
	}

	async deleteSession({ cookies }: { cookies: Cookies }) {
		try {
			const sessionId = this.getCookie(cookies);
			if (!sessionId) return false;
			const [deletedSession] = await db
				.delete(sessions)
				.where(eq(sessions.id, sessionId))
				.returning();
			if (!deletedSession) return false;
			this.deleteCookie(cookies);
			return true;
		} catch (e) {
			console.error('ERROR IN Session.deleteSession');
			console.error(e);
			return false;
		}
	}
}
