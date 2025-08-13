import type { AtLeastOne } from '../helper/utils';
import { Session } from '../session/session';
import type {
	AuthorizeProps,
	CookieConfig,
	GetAuthenticationUrlProps,
	Provider,
	ProviderList,
	SessionConfig
} from './provider';

export type AuthConfig<T extends AtLeastOne<ProviderList>> = {
	provider: T;
	session: SessionConfig;
	cookie: CookieConfig;
};
export class AuthInstance<T extends AtLeastOne<ProviderList>> {
	#session: Session;

	constructor(private config: AuthConfig<T>) {
		this.#session = this.#initSession();
		this.#initProviderConfig();
	}

	#initSession() {
		return new Session({
			cookie: this.config.cookie,
			session: this.config.session
		});
	}

	#initProviderConfig() {
		for (const provider of Object.values(this.config.provider)) {
			if (!provider) throw new Error(`The Given Provider is not valid`);
			if (typeof provider.setConfig !== 'function')
				throw new Error(`Provider ${provider.getName()} is not valid`);

			provider.setConfig({
				cookie: this.config.cookie,
				session: this.config.session
			});
		}
	}

	getAuthenticationUrl<K extends keyof T>(provider: K, props: GetAuthenticationUrlProps) {
		const selectedProvider = this.config.provider[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticationUrl !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticationUrl(props);
	}

	async getAuthenticatedUser<K extends keyof T>(provider: K, props: AuthorizeProps) {
		const selectedProvider = this.config.provider[provider] as Provider;
		if (!selectedProvider || typeof selectedProvider.getAuthenticatedUser !== 'function')
			throw new Error('Invalid Provider');

		return selectedProvider.getAuthenticatedUser({
			cookies: props.cookies,
			url: props.url,
			redirectUri: props.redirectUri
		});
	}

	get session() {
		return this.#session;
	}
}
