import { auth } from '$lib/server/auth/auth';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	handleLogin: async ({ cookies, url, locals }) => {
		if (locals.user) return redirect(302, '/');
		const state = url.search;
		const callbackUri = `${url.origin}/auth/callback/google`;
		const authenticationUrl = auth.getAuthenticationUrl('google', {
			cookie: cookies,
			redirectUri: callbackUri,
			state
		});
		return redirect(302, authenticationUrl);
	}
};
