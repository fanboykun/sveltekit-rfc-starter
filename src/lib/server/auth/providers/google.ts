import {
	ArcticFetchError,
	decodeIdToken,
	generateCodeVerifier,
	generateState,
	Google,
	OAuth2RequestError
} from 'arctic';
import {
	codeAndStateSchema,
	type AuthorizeProps,
	type AuthorizeResult,
	type ClientSecret,
	type GetAuthenticationUrlProps,
	type Provider,
	type ProviderConfig
} from '../instances/provider';
import type { Cookies } from '@sveltejs/kit';

type GoogleUserClaim = {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	email: string;
	email_verified: boolean;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	iat: number;
	exp: number;
};

export class GoogleProvider implements Provider {
	private config?: ProviderConfig;

	constructor(private secrets: ClientSecret) {}

	getName() {
		return 'google' as const;
	}

	#getInstance(redirectUri: string) {
		return new Google(this.secrets.clientId, this.secrets.clientSecret, redirectUri);
	}

	setConfig(config: ProviderConfig) {
		this.config = config;
	}

	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL {
		const instance = this.#getInstance(props.redirectUri);
		const state = props.state || generateState();
		const codeVerifier = generateCodeVerifier();
		const scopes = ['openid', 'profile', 'email'];
		this.#setStateAndCodeVerifierCookies(props.cookie, state, codeVerifier);
		const url = instance.createAuthorizationURL(state, codeVerifier, scopes);
		return url;
	}

	async getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult> {
		try {
			const instance = this.#getInstance(props.redirectUri);
			const codeAndState = this.#validateCodeAndState(props.url, props.cookies);
			if (!codeAndState)
				return {
					success: false as const,
					error: 'Invalid code or state'
				};
			const { code, codeVerifier, state } = codeAndState;

			const tokens = await instance.validateAuthorizationCode(code, codeVerifier);
			const accessToken = tokens.accessToken();
			const idToken = tokens.idToken();
			const user_info = decodeIdToken(idToken) as GoogleUserClaim;

			return {
				success: true as const,
				data: {
					user: {
						token: accessToken,
						name: user_info.name,
						email: user_info.email,
						picture: user_info.picture
					},
					state
				}
			};
		} catch (e) {
			if (e instanceof OAuth2RequestError) {
				console.error('OAuth2RequestError', e);
				return {
					success: false as const,
					error: e.message
				};
			}
			if (e instanceof ArcticFetchError) {
				// Failed to call `fetch()`
				const cause = e.cause;
				console.error('ArcticFetchError', cause);
				return {
					success: false as const,
					error: e.message
				};
			}
			return {
				success: false as const,
				error: 'Failed to get user info'
			};
		}
	}

	#setStateAndCodeVerifierCookies(cookies: Cookies, state: string, codeVerifier: string) {
		// store state as cookie
		cookies.set('state', state, this.config!.cookie);
		// store code verifier as cookie
		cookies.set('codeVerifier', codeVerifier, this.config!.cookie);
	}

	#deleteStateAndCodeVerifierCookies(cookies: Cookies) {
		cookies.delete('state', {
			path: this.config!.cookie.path
		});
		cookies.delete('codeVerifier', {
			path: this.config!.cookie.path
		});
	}

	#validateCodeAndState(url: URL, cookies: Cookies) {
		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');
		const storedState = cookies.get('state');
		const codeVerifier = cookies.get('codeVerifier');

		const codeValidation = codeAndStateSchema.safeParse({
			code: code,
			state: state,
			codeVerifier: codeVerifier,
			storedState: storedState
		});

		if (codeValidation.success === false) {
			return null;
		}
		if (codeValidation.data.state !== codeValidation.data.storedState) {
			return null;
		}

		this.#deleteStateAndCodeVerifierCookies(cookies);
		return codeValidation.data;
	}
}
