import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = ({ locals: { user }, url }) => {
	if (user) return redirect(302, '/dashboard');
	const shouldMockLogin = auth.hasFeature('mockLogin');
	const providers = auth.getAvailableProviders();
	const plugins = auth.getAvailablePlugins();
	const feature = auth.getFeature();
	const state = url.search;
	return { shouldMockLogin, state, providers, plugins, feature };
};
