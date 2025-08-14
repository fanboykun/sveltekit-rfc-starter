import type { Cookies } from '@sveltejs/kit';

export type SessionPayload = {
	userId: string;
	ipAddress: string;
	userAgent: string;
};

export interface SessionManager {
	getSession<T extends SessionPayload = SessionPayload>(props: {
		cookies: Cookies;
	}): Promise<T | null>;
	setSession<T extends SessionPayload = SessionPayload>(props: {
		cookies: Cookies;
		sessionId: string;
		data: T;
	}): Promise<boolean>;
	deleteSession(props: { cookies: Cookies }): Promise<boolean>;
}
