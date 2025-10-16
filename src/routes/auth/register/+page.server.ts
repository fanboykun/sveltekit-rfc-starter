import { dev } from '$app/environment';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$lib/server/config/env';

export const load: PageServerLoad = ({ locals: { user }, url }) => {
	if (user) return redirect(302, '/dashboard');
	const shouldMockLogin = env('MOCK_LOGIN', dev);
	const providers = auth.getAvailableProviders();
	const plugins = auth.getAvailablePlugins();
	const state = url.search;
	return { shouldMockLogin, state, providers, plugins };
};
