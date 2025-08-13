import type { RedisInstance } from '$lib/server/redis/redis';
import type { Cookies } from '@sveltejs/kit';
import type { CookieConfig, SessionConfig } from '../instances/provider';

export type SessionPayload = {
	userId: string;
	ipAddress: string;
	userAgent: string;
};

export class Session {
	constructor(private config: { session: SessionConfig; cookie: CookieConfig }) {}

	generateSessionLifetime() {
		const cacheTtl = Math.floor((this.config.session.ttl * 30) / 1000);
		const cookieTtl = new Date(Date.now() + cacheTtl * 1000);
		return { cacheTtl, cookieTtl };
	}

	#setKey(sessionId: string) {
		return `${this.config.session.name}:${sessionId}`;
	}

	async setSession({
		redis,
		cookies,
		sessionId,
		data
	}: {
		redis: RedisInstance;
		cookies: Cookies;
		sessionId: string;
		data: SessionPayload;
	}) {
		try {
			const ttl = this.generateSessionLifetime();
			cookies.set(this.config.session.name, sessionId, {
				...this.config.cookie,
				expires: ttl.cookieTtl
			});
			const client = await redis.getClient();
			const prefixedKey = this.#setKey(sessionId);
			const str = JSON.stringify(data);
			await client.set(prefixedKey, str, 'EX', ttl.cacheTtl);
			return true;
		} catch (error) {
			console.error('ERROR IN Session.setSession');
			console.error(error);
			return false;
		}
	}

	async getSession({ redis, cookies }: { redis: RedisInstance; cookies: Cookies }) {
		try {
			const sessionId = cookies.get(this.config.session.name);
			if (!sessionId) return null;
			const client = await redis.getClient();
			const prefixedKey = this.#setKey(sessionId);
			const value = await client.get(prefixedKey);
			if (!value) return null;
			return JSON.parse(value) as SessionPayload;
		} catch (error) {
			console.error('ERROR IN Session.getSession');
			console.error(error);
			return null;
		}
	}

	async deleteSession({ redis, cookies }: { redis: RedisInstance; cookies: Cookies }) {
		try {
			const sessionId = cookies.get(this.config.session.name);
			if (!sessionId) return false;
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
