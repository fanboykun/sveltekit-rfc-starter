import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { auth } from '$lib/server/auth';
import { Models } from '$lib/server/db/models';
import type { AuthProviderType } from '$lib/shared/enums/enum';

export const GET = async (event: RequestEvent) => {
	if (event.locals.user) return redirect(302, '/');
	const provider = event.params.rest as AuthProviderType; // we already match the params, see params/auth_provider.ts
	const redirectUri = `${event.url.origin}/auth/callback/${provider}`;
	const authorizationResult = await auth.getAuthenticatedUser(provider, {
		cookies: event.cookies,
		url: event.url,
		redirectUri
	});
	if (!authorizationResult.success) {
		return redirect(302, `/auth/login?error=${authorizationResult.error}`);
	}

	const { data } = authorizationResult;
	const user = await new Models.User().upsertByEmail({
		name: data.user.name,
		email: data.user.email,
		provider,
		accessToken: data.user.accessToken,
		refreshToken: data.user.refreshToken,
		image: data.user.picture
	});
	if (!user) return redirect(302, `/auth/login?error=Failed to create user`);

	const userId = user.id;
	await auth.session.setSession({
		cookies: event.cookies,
		sessionId: data.user.accessToken,
		data: {
			userId,
			ipAddress: event.getClientAddress() || '0.0.0.0',
			userAgent: event.request.headers.get('user-agent') || 'Unknown'
		}
	});

	const searchParams = new URLSearchParams(data.state);
	const redirectTo = searchParams.get('redirectTo') || '/';
	return redirect(302, redirectTo.startsWith('/') ? redirectTo : '/');
};
