import {
	ArcticFetchError,
	generateCodeVerifier,
	generateState,
	GitHub,
	OAuth2RequestError,
	UnexpectedErrorResponseBodyError,
	UnexpectedResponseError
} from 'arctic';
import {
	type AuthorizeProps,
	type AuthorizeResult,
	type ProviderConfig,
	type GetAuthenticationUrlProps,
	type Provider,
	State
} from '../core';

type GithubUserClaim = {
	name: string;
	avatar_url: string;
	email: string | null;
};

type GithubEmailsClaim = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
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
		return new GitHub(this.secrets.clientId, this.secrets.clientSecret, redirectUri);
	}

	getAuthenticationUrl(props: GetAuthenticationUrlProps): URL {
		const instance = this.#getInstance(props.redirectUri);
		const state = props.state || generateState();
		const codeVerifier = generateCodeVerifier();
		const scopes = this.secrets.scopes || ['read:user', 'user:email'];
		this.setState(props.cookie, state, codeVerifier);
		const url = instance.createAuthorizationURL(state, scopes);
		return url;
	}

	async getAuthenticatedUser(props: AuthorizeProps): Promise<AuthorizeResult> {
		try {
			const instance = this.#getInstance(props.redirectUri);
			const codeAndState = this.getState(props.url, props.cookies);
			if (!codeAndState)
				return {
					success: false as const,
					error: 'Invalid code or state'
				};
			const { code, state } = codeAndState;

			const tokens = await instance.validateAuthorizationCode(code);
			const refreshToken = tokens.hasRefreshToken() ? tokens.refreshToken() : null;
			const accessToken = tokens.accessToken();
			const [userClaimResponse, emailClaimResponse] = await Promise.all([
				fetch('https://api.github.com/user', {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}),
				fetch('https://api.github.com/user/emails', {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				})
			]);
			const [userClaim, emailClaim] = (await Promise.all([
				userClaimResponse.json(),
				emailClaimResponse.json()
			])) as [GithubUserClaim, GithubEmailsClaim[]];
			if (!userClaim.email) {
				const email = emailClaim.find((email: GithubEmailsClaim) => email.primary)?.email;
				if (!email)
					return {
						success: false as const,
						error: 'Failed to get user info'
					};
				userClaim.email = email;
			}
			return {
				success: true as const,
				data: {
					user: {
						accessToken,
						refreshToken,
						name: userClaim.name,
						email: userClaim.email,
						picture: userClaim.avatar_url
					},
					state
				}
			};
		} catch (e) {
			if (e instanceof ArcticFetchError) {
				// Failed to call `fetch()`
				const cause = e.cause;
				console.error('ArcticFetchError', cause);
				return {
					success: false as const,
					error: e.message
				};
			}
			if (e instanceof UnexpectedResponseError) {
				console.error('UnexpectedResponseError', e);
				return {
					success: false as const,
					error: e.message
				};
			}
			if (e instanceof UnexpectedErrorResponseBodyError) {
				console.error('UnexpectedErrorResponseBodyError', e);
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
			await instance.refreshAccessToken(props.token);
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
