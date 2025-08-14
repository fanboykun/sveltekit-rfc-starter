import { dev } from '$app/environment';
import { deepMerge, type AtLeastOne } from '../helper/utils';
import type { SessionManager } from '../session/manager';
import { Session } from '../session/session';
import type { AuthorizeProps, GetAuthenticationUrlProps, Provider, ProviderList } from './provider';

export type AuthConfig = {
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
export type AuthProps<T extends AtLeastOne<ProviderList>> = {
	provider: T;
	session?: (config: AuthConfig) => SessionManager;
	config?: Partial<AuthConfig>;
};
export class AuthInstance<T extends AtLeastOne<ProviderList>> {
	public session: SessionManager;
	private provider: T;
	private config: Required<AuthConfig>;

	constructor(props: AuthProps<T>) {
		this.config = this.#initConfig(props.config);
		this.session =
			props.session && typeof props.session === 'function'
				? props.session(this.config)
				: this.#initSession();

		// this.provider = this.#initProvider(props.provider);
		this.provider = props.provider;
	}

	#initSession() {
		return new Session(this.config);
	}

	#initConfig(config?: Partial<AuthConfig>): Required<AuthConfig> {
		return deepMerge(config ?? {}, {
			origin: process.env.ORIGIN!,
			baseCallbackPathname: 'auth/callback' as const,
			sessionName: 'auth_session',
			sessionLifetime: 604800, // 7 days in seconds
			cookieOptions: {
				secure: !dev,
				path: '/',
				httpOnly: true,
				sameSite: 'lax'
			}
		});
	}

	// #initProvider(provider: T) {
	// 	for (const provider of Object.values(this.provider)) {
	// 		if (!provider) throw new Error(`The Given Provider is not valid`);
	// 		if (typeof provider.setConfig !== 'function')
	// 			throw new Error(`Provider ${provider.getName()} is not valid`);

	// 		provider.setConfig(this.config);
	// 	}
	// 	return provider;
	// }

	#setCallbackUri(provider: Provider) {
		const origin = this.config.origin.endsWith('/')
			? this.config.origin.slice(0, -1)
			: this.config.origin;
		const path = this.config.baseCallbackPathname.startsWith('/')
			? this.config.baseCallbackPathname.slice(1)
			: this.config.baseCallbackPathname;
		return `${origin}/${path}/${provider.getName()}` as const;
	}

	getAuthenticationUrl<K extends keyof T>(
		provider: K,
		props: Omit<GetAuthenticationUrlProps, 'redirectUri'> & { redirectUri?: string }
	) {
		const selectedProvider = this.provider[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticationUrl !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticationUrl({
			...props,
			redirectUri: props.redirectUri || this.#setCallbackUri(selectedProvider)
		});
	}

	async getAuthenticatedUser<K extends keyof T>(
		provider: K,
		props: Omit<AuthorizeProps, 'redirectUri'> & { redirectUri?: string }
	) {
		const selectedProvider = this.provider[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticatedUser !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticatedUser({
			cookies: props.cookies,
			url: props.url,
			redirectUri: props.redirectUri || this.#setCallbackUri(selectedProvider)
		});
	}
}
