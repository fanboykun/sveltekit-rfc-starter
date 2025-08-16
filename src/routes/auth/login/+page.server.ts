import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = ({ locals: { user }, url }) => {
	if (user) return redirect(302, '/dashboard');
	const shouldMockLogin = env.MOCK_LOGIN ? env.MOCK_LOGIN === 'true' : dev;
	const providers = auth.getAvailableProviders();
	const state = url.search;
	return { shouldMockLogin, state, providers };
};
