import { command, form, getRequestEvent } from '$app/server';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { auth } from '$lib/server/auth';
import { dev } from '$app/environment';
import { Models } from '$lib/server/db/models';

export const handleMockLogin = form(async (data) => {
	const { locals, cookies, getClientAddress, request } = getRequestEvent();

	if (locals.user) return redirect(302, '/');
	if (!dev || process.env.NODE_ENV === 'production')
		return fail(400, { message: 'Mock login is disabled' });

	const validated = z
		.object({
			name: z.string().min(4).max(255),
			email: z.email(),
			state: z.string().optional()
		})
		.safeParse(Object.fromEntries(data));
	if (!validated.success) {
		return fail(400, {
			message: 'Invalid payload',
			errors: validated.error.flatten().fieldErrors
		});
	}

	const accessToken = crypto.randomUUID();
	const user = await new Models.User().upsertByEmail({
		name: validated.data.name,
		email: validated.data.email,
		provider: 'google',
		accessToken
	});
	if (!user)
		return fail(400, {
			message: 'Failed to create user'
		});

	const setSessionResult = await auth.session.setSession({
		cookies: cookies,
		sessionId: accessToken,
		data: {
			userId: user.id,
			ipAddress: getClientAddress() || '0.0.0.0',
			userAgent: request.headers.get('user-agent') || 'Unknown'
		}
	});
	if (!setSessionResult)
		return fail(400, {
			message: 'Failed to set session'
		});

	const searchParams = new URLSearchParams(validated.data.state);
	const redirectTo = searchParams.get('redirectTo') || '/';
	return redirect(302, redirectTo.startsWith('/') ? redirectTo : '/');
});

export const handleLogout = command(async () => {
	const { locals, cookies } = getRequestEvent();
	if (!locals.user) return fail(400, { message: 'User not found' });
	await auth.session.deleteSession({ cookies });
	return { success: true };
});

export const handleLogin = command(
	z.object({
		state: z.string().optional(),
		provider: z.enum(auth.getAvailableProviders()).default('google')
	}),
	async ({ state, provider }) => {
		const { locals, cookies, url } = getRequestEvent();
		if (locals.user) return fail(400, { message: 'User already logged in' });
		const callbackUri = `${url.origin}/auth/callback/${provider}`;
		const authenticationUrl = auth.getAuthenticationUrl(provider, {
			cookie: cookies,
			redirectUri: callbackUri,
			state
		});
		return {
			redirect: authenticationUrl.toString()
		};
	}
);
