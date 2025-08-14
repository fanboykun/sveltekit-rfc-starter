import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = ({ locals: { user }, url }) => {
	if (user) return redirect(302, '/');
	const shouldMockLogin = env.MOCK_LOGIN === 'true' || dev;

	const state = url.search;
	return { shouldMockLogin, state };
};
