import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { auth } from '$lib/server/auth/auth';
import redis from '$lib/server/redis/redis';

export const GET = async (event: RequestEvent) => {
	if (event.locals.user) return redirect(302, '/');
	const redirectUri = `${event.url.origin}/auth/callback/google`;
	const authorizationResult = await auth.getAuthenticatedUser('google', {
		cookies: event.cookies,
		url: event.url,
		redirectUri
	});
	if (!authorizationResult.success) {
		return redirect(302, `/auth/login?error=${authorizationResult.error}`);
	}
	const userId = crypto.randomUUID();
	const { data } = authorizationResult;
	await auth.session.setSession({
		redis: redis,
		cookies: event.cookies,
		sessionId: data.user.token,
		data: {
			userId,
			ipAddress: event.getClientAddress() || '0.0.0.0',
			userAgent: event.request.headers.get('user-agent') || 'Unknown'
		}
	});
	const redirectTo = data.state && data.state.startsWith('/') ? data.state : '/';
	return redirect(302, redirectTo);
};
