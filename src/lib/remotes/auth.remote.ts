import { command, getRequestEvent } from '$app/server';
import { z } from 'zod/v4';
import { auth } from '$lib/server/auth';
import { dev } from '$app/environment';
import { Models } from '$lib/server/db/models';
import { RemoteResponse } from '$lib/shared/utils/remote-response';

export const handleMockLogin = command(
	z.object({
		name: z.string().min(4).max(255),
		email: z.email(),
		state: z.string().optional()
	}),
	async ({ name, email, state }) => {
		if (!auth.hasFeature('mockLogin')) {
			return RemoteResponse.failure({ message: 'Mock login is disabled', error: {} });
		}
		const { locals, cookies, getClientAddress, request } = getRequestEvent();

		if (locals.user) {
			return RemoteResponse.go({ location: '/', message: 'User already logged in' });
		}
		if (!dev || process.env.NODE_ENV === 'production') {
			return RemoteResponse.failure({ message: 'Mock login is disabled', error: {} });
		}

		const accessToken = crypto.randomUUID();
		const user = await new Models.User().upsertByEmail({
			name,
			email,
			provider: 'google',
			accessToken
		});
		if (!user) return RemoteResponse.failure({ message: 'Failed to create user', error: {} });

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
			return RemoteResponse.failure({ message: 'Failed to set session', error: {} });

		const searchParams = new URLSearchParams(state);
		const redirectTo = searchParams.get('redirectTo') || '/';
		return RemoteResponse.go({
			location: redirectTo.startsWith('/') ? redirectTo : '/',
			message: 'User logged in successfully'
		});
	}
);

export const handleLogout = command(async () => {
	const { locals, cookies } = getRequestEvent();
	if (!locals.user) return RemoteResponse.failure({ message: 'User not found', error: {} });
	await auth.session.deleteSession({ cookies });
	return RemoteResponse.success({ message: 'User logged out successfully', data: {} });
});

export const handleProviderLogin = command(
	z.object({
		state: z.string().optional(),
		provider: z.enum(auth.getAvailableProviders())
	}),
	async ({ state, provider }) => {
		const { cookies, url, locals } = getRequestEvent();
		if (locals.user) {
			return RemoteResponse.failure({ message: 'User already logged in', error: {} });
		}
		const callbackUri = `${url.origin}/auth/callback/${provider}`;
		const authenticationUrl = auth.getAuthenticationUrl(provider, {
			cookie: cookies,
			redirectUri: callbackUri,
			state
		});
		return RemoteResponse.go({ location: authenticationUrl.toString(), message: 'Redirecting' });
	}
);

export const handlePluginLogin = command(
	z.object({
		state: z.string().optional(),
		plugin: z.enum(auth.getAvailablePlugins()),
		payload: z.object({
			email: z.email(),
			password: z.string({ error: 'Invalid Password' }).min(4).max(255)
		})
	}),
	async ({ state, plugin, payload }) => {
		const { cookies, getClientAddress, request, locals } = getRequestEvent();
		if (locals.user) {
			return RemoteResponse.failure({ message: 'User already logged in', error: {} });
		}
		const selectedPlugin = auth.plugins[plugin];
		if (!selectedPlugin) return RemoteResponse.failure({ message: 'Plugin not found', error: {} });
		const authenticationResult = await selectedPlugin.login(payload.email, payload.password);
		if (!authenticationResult.success) {
			return RemoteResponse.failure({ message: authenticationResult.error, error: {} });
		}
		const searchParamsState = new URLSearchParams(state);
		const redirectTo = searchParamsState.get('redirectTo') || '/dashboard';
		searchParamsState.delete('redirectTo');
		await auth.session.setSession({
			cookies,
			data: {
				userId: authenticationResult.data.user.id,
				ipAddress: getClientAddress() || '0.0.0.0',
				userAgent: request.headers.get('user-agent') || 'Unknown'
			}
		});
		return RemoteResponse.go({
			location: `${redirectTo.startsWith('/') ? redirectTo : '/dashboard'}?${searchParamsState.toString()}`,
			message: 'Login Successfull'
		});
	}
);

export const handlePasswordRegister = command(
	z.object({
		state: z.string().optional(),
		payload: z
			.object({
				name: z.string().min(3),
				email: z.string({ error: 'Invalid Email' }).email(),
				password: z.string({ error: 'Invalid Password' }).min(4).max(255),
				confirmPassword: z.string({ error: 'Invalid Password' }).min(4).max(255)
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: 'Passwords do not match',
				path: ['confirmPassword']
			})
	}),
	async ({ payload }) => {
		const { locals, url, cookies, getClientAddress, request } = getRequestEvent();
		if (locals.user) {
			return RemoteResponse.failure({ message: 'User already logged in', error: {} });
		}
		const registerResult = await auth.plugins.password.register({
			...payload,
			cookies,
			url,
			emailVerification: auth.hasFeature('emailVerification')
		});
		if (!registerResult.success) {
			return RemoteResponse.failure({ message: registerResult.error, error: {} });
		}

		if (auth.hasFeature('emailVerification')) {
			if (!registerResult.data.verification) {
				return RemoteResponse.failure({ message: 'Verification failed', error: {} });
			}
			return RemoteResponse.go({
				location: `/auth/verify`,
				message: 'Verification Email Sent'
			});
		}

		await auth.session.setSession({
			cookies,
			data: {
				userId: registerResult.data.user.id,
				ipAddress: getClientAddress() || '0.0.0.0',
				userAgent: request.headers.get('user-agent') || 'Unknown'
			}
		});
		return RemoteResponse.go({
			location: '/dashboard',
			message: 'Login Successfull'
		});
	}
);

export const sendVerificationEmail = command(
	z.object({ email: z.email().optional() }),
	async ({ email: em }) => {
		if (!auth.hasFeature('emailVerification')) {
			return RemoteResponse.failure({ message: 'Email verification is disabled', error: {} });
		}
		const { cookies, url, locals } = getRequestEvent();
		const email = locals.user?.email ?? em;
		if (!email)
			return RemoteResponse.failure({ message: 'Verification email not found', error: {} });
		const user = locals.user ?? (await new Models.User().findByEmail(email));
		if (!user) return RemoteResponse.failure({ message: 'User not found', error: {} });
		if (user.emailVerifiedAt)
			return RemoteResponse.go({ location: '/dashboard', message: 'User already verified' });
		const verificationResult = await auth.plugins.password.refreshVerificationEmail({
			url,
			email,
			userId: user.id,
			cookies
		});
		if (!verificationResult.success) {
			return RemoteResponse.failure({ message: verificationResult.error, error: {} });
		}
		const { expiration } = verificationResult.data.verification;
		return RemoteResponse.success({
			message: 'Verification email sent',
			data: { expiration: Date.now() - expiration.getTime() }
		});
	}
);

export const handleVerifyEmail = command(z.object({ token: z.string() }), async ({ token }) => {
	if (!auth.hasFeature('emailVerification')) {
		return RemoteResponse.failure({ message: 'Email verification is disabled', error: {} });
	}
	const { locals, cookies, getClientAddress, request } = getRequestEvent();
	if (locals.user?.emailVerifiedAt) {
		return RemoteResponse.go({ location: '/dashboard', message: 'User already verified' });
	}
	const verificationResult = await auth.plugins.password.verify({ cookies, token });
	if (!verificationResult.success) {
		return RemoteResponse.failure({ message: verificationResult.error, error: {} });
	}
	await auth.session.setSession({
		cookies,
		data: {
			userId: verificationResult.data.user.id,
			ipAddress: getClientAddress() || '0.0.0.0',
			userAgent: request.headers.get('user-agent') || 'Unknown'
		}
	});
	return RemoteResponse.go({
		location: '/dashboard',
		message: 'Login Successfull'
	});
});
