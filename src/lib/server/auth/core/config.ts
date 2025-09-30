import type { Cookies } from '@sveltejs/kit';
import type { AtLeastOne } from './utils';
// import type { AtLeastOne } from './utils';

export type AuthConfig = {
	secret?: string;
	origin?: string;
	baseCallbackPathname?: 'auth/callback' | (string & {});
	sessionName: string;
	sessionLifetime: number;
	cookieOptions: {
		secure: boolean;
		path: string;
		httpOnly: boolean;
		sameSite: boolean | 'lax' | 'strict' | 'none';
	};
};

export type AuthProps<
	T extends AtLeastOne<ProviderList>,
	Plugins extends Record<string, unknown> | undefined,
	Session extends SessionManager
> = {
	provider?: T;
	session: (config: AuthConfig) => Session;
	config?: Partial<AuthConfig>;
	plugins?: Plugins;
};

type ProviderNames = ReturnType<
	(typeof import('../providers/index'))[keyof typeof import('../providers/index')]['name']
>;
export type ProviderList = { [K in ProviderNames]: Provider };
export interface ProviderConfig {
	clientId: string;
	clientSecret: string;
	scopes?: string[];
}

export type SessionConfig = {
	name: string;
	ttl: number;
};

export type CookieConfig = {
	secure: boolean;
	path: string;
	httpOnly: boolean;
	maxAge: number;
	sameSite: 'lax' | 'strict' | 'none';
};

export type UserFromProvider = {
	email: string;
	name: string;
	picture: string;
	accessToken: string;
	refreshToken: string | null;
};
export type GetAuthenticationUrlProps = {
	cookie: Cookies;
	state?: string;
	redirectUri: string;
};
export type AuthorizeProps = {
	url: URL;
	cookies: Cookies;
	redirectUri: string;
};
export type AuthorizeResult =
	| { success: true; data: { user: UserFromProvider; state: string }; message?: string }
	| { success: false; error: string; message?: string };

export interface Provider {
	getName(): ProviderNames;
	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL;
	getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult>;
}

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
		sessionId?: string;
		data: T;
	}): Promise<boolean>;
	deleteSession(props: { cookies: Cookies }): Promise<boolean>;
}

export type StateConfig = {
	stateName: string;
	codeName: string;
	codeVerifierName: string;
};
