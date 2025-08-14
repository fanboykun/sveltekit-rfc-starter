import redis from '$lib/server/redis/redis';
import type { Cookies } from '@sveltejs/kit';
import { type SessionManager, type SessionPayload } from './manager';
import type { AuthConfig } from '../instances/instance';

export class Session implements SessionManager {
	constructor(private config: AuthConfig) {}

	#setKey(sessionId: string) {
		return `${this.config.sessionName}:${sessionId}` as const;
	}

	async setSession({
		cookies,
		sessionId,
		data
	}: {
		cookies: Cookies;
		sessionId: string;
		data: SessionPayload;
	}) {
		try {
			const cookieExpiresAt = new Date(Date.now() + this.config.sessionLifetime * 1000);
			const redisTtl = this.config.sessionLifetime;
			const client = await redis.getClient();
			const prefixedKey = this.#setKey(sessionId);
			const str = JSON.stringify(data);
			await client.set(prefixedKey, str, 'EX', redisTtl);
			cookies.set(this.config.sessionName, sessionId, {
				...this.config.cookieOptions,
				expires: cookieExpiresAt
			});
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
			const sessionId = cookies.get(this.config.sessionName);
			if (!sessionId) return null;
			const client = await redis.getClient();
			const prefixedKey = this.#setKey(sessionId);
			const value = await client.get(prefixedKey);
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
			const sessionId = cookies.get(this.config.sessionName);
			if (!sessionId) return false;
			cookies.delete(this.config.sessionName, { path: '/' });
			const client = await redis.getClient();
			const prefixedKey = this.#setKey(sessionId);
			await client.del(prefixedKey);
			return true;
		} catch (e) {
			console.error('ERROR IN Session.deleteSession');
			console.error(e);
			return false;
		}
	}
}
