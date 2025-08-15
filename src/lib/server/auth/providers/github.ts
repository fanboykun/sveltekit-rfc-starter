import {
	ArcticFetchError,
	decodeIdToken,
	generateCodeVerifier,
	generateState,
	Google,
	OAuth2RequestError
} from 'arctic';
import {
	type AuthorizeProps,
	type AuthorizeResult,
	type ProviderConfig,
	type GetAuthenticationUrlProps,
	type Provider,
	State
} from '../core';

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

export class GithubProvider extends State implements Provider {
	static name = () => 'github' as const;

	constructor(private secrets: ProviderConfig) {
		super();
	}

	getName() {
		return 'github' as const;
	}

	#getInstance(redirectUri: string) {
		return new Google(this.secrets.clientId, this.secrets.clientSecret, redirectUri);
	}

	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL {
		const instance = this.#getInstance(props.redirectUri);
		const state = props.state || generateState();
		const codeVerifier = generateCodeVerifier();
		const scopes = this.secrets.scopes || ['openid', 'profile', 'email'];
		// this.#setStateAndCodeVerifierCookies(props.cookie, state, codeVerifier);
		this.setState(props.cookie, state, codeVerifier);
		const url = instance.createAuthorizationURL(state, codeVerifier, scopes);
		return url;
	}

	async getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult> {
		try {
			const instance = this.#getInstance(props.redirectUri);
			// const codeAndState = this.#validateCodeAndState(props.url, props.cookies);
			const codeAndState = this.getState(props.url, props.cookies);
			if (!codeAndState)
				return {
					success: false as const,
					error: 'Invalid code or state'
				};
			const { code, codeVerifier, state } = codeAndState;

			const tokens = await instance.validateAuthorizationCode(code, codeVerifier);
			const refreshToken = tokens.hasRefreshToken() ? tokens.refreshToken() : null;
			const accessToken = tokens.accessToken();
			const idToken = tokens.idToken();
			const user_info = decodeIdToken(idToken) as GoogleUserClaim;

			return {
				success: true as const,
				data: {
					user: {
						accessToken,
						refreshToken,
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
			console.error('Unknwon error', e);
			return {
				success: false as const,
				error: 'Failed to get user info'
			};
		}
	}

	async revokeToken(props: { redirectUri: string; token: string }) {
		try {
			const instance = this.#getInstance(props.redirectUri);
			await instance.revokeToken(props.token);
			return true;
		} catch (e) {
			if (e instanceof OAuth2RequestError) {
				// Invalid authorization code, credentials, or redirect URI
				console.error('OAuth2RequestError', e);
				return false;
			}
			if (e instanceof ArcticFetchError) {
				// Failed to call `fetch()`
				console.error('ArcticFetchError', e);
				return false;
			}
			// Parse error
			console.error('Parse error', e);
			return false;
		}
	}
}
