import { dev } from '$app/environment';
import { deepMerge, type AtLeastOne } from './utils';
import type { ProviderList, SessionManager } from './config';
import type {
	AuthConfig,
	AuthProps,
	AuthorizeProps,
	GetAuthenticationUrlProps,
	Provider
} from './config';

export class AuthInstance<
	T extends AtLeastOne<ProviderList>,
	Plugins extends Record<string, unknown> | undefined,
	Session extends SessionManager
> {
	public session: Session;
	private provider?: T;
	private config: Required<AuthConfig>;
	public plugins: Plugins;

	/**
	 * Initializes a new AuthInstance.
	 *
	 * @param props - The dependencies and configuration required to construct the instance.
	 * @returns A new AuthInstance configured with the provided session manager and providers.
	 */
	constructor(props: AuthProps<T, Plugins, Session>) {
		this.config = this.#initConfig(props.config);
		this.session = props.session(this.config);
		this.plugins = props.plugins ?? ({} as Plugins);
		this.provider = props.provider;
	}

	/**
	 * Merge user-provided auth configuration with sane defaults.
	 *
	 * This method determines the runtime origin and applies environment-aware defaults
	 * for cookies, session lifetime, and base callback path.
	 *
	 * @param config - Partial configuration overrides.
	 * @returns The fully resolved and validated AuthConfig.
	 */
	#initConfig(config?: Partial<AuthConfig>): Required<AuthConfig> {
		const buildOrigin = () => {
			const node_origin = process.env.ORIGIN;
			if (node_origin) return node_origin;
			return 'http://localhost:5173';
		};
		const merged = deepMerge(
			// default config
			{
				secret: process.env.AUTH_SECRET!, // if undefined, it will be setted by Base Session
				origin: buildOrigin(),
				baseCallbackPathname: 'auth/callback' as const,
				sessionName: 'auth_session',
				sessionLifetime: 604800, // 7 days in seconds
				cookieOptions: {
					secure: !dev,
					path: '/',
					httpOnly: true,
					sameSite: 'lax'
				}
			},
			config ?? {} // user defined config
		) as Required<AuthConfig>;

		/**
		 * since origin only used for setting callback uri, it is not required
		 * so instead, every provider should check and build the callback uri
		 * and throw if cannot determine the origin
		 */
		// if (!merged.origin)
		// 	throw new Error(
		// 		'Cannot determine origin either from node env or config, please set the origin in config'
		// 	);

		return merged;
	}

	/**
	 * Build the provider callback URI based on current configuration and provider name.
	 *
	 * @param provider - The provider instance used to derive the callback path segment.
	 * @returns The absolute callback URI for the given provider.
	 */
	#setCallbackUri(provider: Provider) {
		const origin = this.config.origin.endsWith('/')
			? this.config.origin.slice(0, -1)
			: this.config.origin;
		const path = this.config.baseCallbackPathname.startsWith('/')
			? this.config.baseCallbackPathname.slice(1)
			: this.config.baseCallbackPathname;
		return `${origin}/${path}/${provider.getName()}` as const;
	}

	/**
	 * Get the list of available provider keys registered in this instance.
	 *
	 * @returns A tuple containing the provider keys.
	 */
	getAvailableProviders() {
		return Object.keys(this.provider ?? {}) as [keyof T];
	}

	getAvailablePlugins() {
		return Object.keys(this.plugins ?? {}) as [keyof Plugins];
	}

	/**
	 * Generate the authentication URL for the specified provider.
	 *
	 * If `redirectUri` is not provided, a default callback URI is derived from the
	 * instance configuration and provider name.
	 *
	 * @typeParam K - The provider key within the provider map `T`.
	 * @param provider - The provider key to generate the URL for.
	 * @param props - Provider-specific parameters excluding `redirectUri` which is optional here.
	 * @returns The provider-specific authentication URL.
	 * @throws Error if the provider is invalid or does not implement `getAuthenticationUrl`.
	 */
	getAuthenticationUrl<K extends keyof T>(
		provider: K,
		props: Omit<GetAuthenticationUrlProps, 'redirectUri'> & { redirectUri?: string }
	) {
		const selectedProvider = this.provider?.[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticationUrl !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticationUrl({
			...props,
			redirectUri: props.redirectUri || this.#setCallbackUri(selectedProvider)
		});
	}

	/**
	 * Resolve the authenticated user for the specified provider.
	 *
	 * If `redirectUri` is not provided, a default callback URI is derived from the
	 * instance configuration and provider name.
	 *
	 * @typeParam K - The provider key within the provider map `T`.
	 * @param provider - The provider key to authorize.
	 * @param props - Authorization parameters excluding `redirectUri` which is optional here.
	 * @returns The authenticated user object as returned by the provider.
	 * @throws Error if the provider is invalid or does not implement `getAuthenticatedUser`.
	 */
	async getAuthenticatedUser<K extends keyof T>(
		provider: K,
		props: Omit<AuthorizeProps, 'redirectUri'> & { redirectUri?: string }
	) {
		const selectedProvider = this.provider?.[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticatedUser !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticatedUser({
			cookies: props.cookies,
			url: props.url,
			redirectUri: props.redirectUri || this.#setCallbackUri(selectedProvider)
		});
	}
}
