import type { Cookies } from '@sveltejs/kit';
import z4 from 'zod/v4';

export const providers = ['google'] as const;

export type ProviderList = { [K in (typeof providers)[number]]: Provider };

export type ClientSecret = {
	clientId: string;
	clientSecret: string;
};

export interface ProviderConfig {
	session: SessionConfig;
	cookie: CookieConfig;
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
	token: string;
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
	| { success: true; data: { user: UserFromProvider; state: string } }
	| { success: false; error: string };

export const codeAndStateSchema = z4.object({
	code: z4.string(),
	codeVerifier: z4.string(),
	state: z4.string(),
	storedState: z4.string()
});

export interface Provider {
	getName(): (typeof providers)[number];
	setConfig(config: ProviderConfig): void;
	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL;
	getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult>;
}
