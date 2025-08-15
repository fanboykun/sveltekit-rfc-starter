import redis from '$lib/server/redis/redis';
import type { Cookies } from '@sveltejs/kit';
import { type SessionManager, type SessionPayload, type AuthConfig, BaseSession } from '../core';

/**
 * This is an example of a session manager that uses Redis to store session data.
 * You can add any other session manager you want using any other storage like db, file, etc.
 * Make sure to extends to `BaseSession` and implements `SessionManager`.
 */
export class RedisSession extends BaseSession implements SessionManager {
	constructor(config: AuthConfig) {
		super(config);
	}

	#setKey(sessionId: string) {
		return `${this.config.sessionName}:${sessionId}` as const;
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

			const redisTtl = this.config.sessionLifetime;
			const client = await redis.getClient();
			const str = JSON.stringify(data);
			await client.set(this.#setKey(sessionId), str, 'EX', redisTtl);

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
			const client = await redis.getClient();
			const value = await client.get(this.#setKey(sessionId));
			if (!value) return null;
			return JSON.parse(value) as T;
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
			const client = await redis.getClient();
			await client.del(this.#setKey(sessionId));
			this.deleteCookie(cookies);
			return true;
		} catch (e) {
			console.error('ERROR IN Session.deleteSession');
			console.error(e);
			return false;
		}
	}
}
