import type { Cookies } from '@sveltejs/kit';
import z4 from 'zod/v4';
// import type { AuthConfig } from './instance';

export const providers = ['google'] as const;

export type ProviderList = { [K in (typeof providers)[number]]: Provider };

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
	refreshToken: string;
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
	// setConfig(config: AuthConfig): void;
	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL;
	getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult>;
}
