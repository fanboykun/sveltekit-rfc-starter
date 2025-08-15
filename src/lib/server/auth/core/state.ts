import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import type { StateConfig } from './config';

export abstract class State {
	private cookieOpts = {
		maxAge: 60 * 10, // 10 minutes in seconds
		path: '/',
		sameSite: 'lax',
		httpOnly: true,
		secure: !dev
	} as const;
	private stateName = 'state';
	private codeName = 'code';
	private codeVerifierName = 'codeVerifier';

	constructor(config?: Partial<StateConfig>) {
		if (config) {
			this.stateName = config.stateName || this.stateName;
			this.codeName = config.codeName || this.codeName;
			this.codeVerifierName = config.codeVerifierName || this.codeVerifierName;
		}
	}

	setState(cookies: Cookies, state: string, codeVerifier: string | null) {
		// store state as cookie
		cookies.set(this.stateName, state, this.cookieOpts);
		// store code verifier as cookie
		if (codeVerifier) cookies.set(this.codeVerifierName, codeVerifier, this.cookieOpts);
	}

	getState(url: URL, cookies: Cookies) {
		const code = url.searchParams.get(this.codeName);
		const state = url.searchParams.get(this.stateName);
		const storedState = cookies.get(this.stateName);
		const codeVerifier = cookies.get(this.codeVerifierName);

		if (!code || !state || !storedState) return null;
		if (state !== storedState) return null;

		this.deleteState(cookies);
		return {
			code,
			codeVerifier,
			state,
			storedState
		};
	}

	private deleteState(cookies: Cookies) {
		cookies.delete(this.stateName, {
			path: '/'
		});
		cookies.delete(this.codeVerifierName, {
			path: '/'
		});
	}
}
