import { auth } from '$lib/server/auth';
import type { PageServerLoad, PageServerLoadEvent } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const {
		locals: { user },
		cookies
	} = event;
	if (user && user.emailVerifiedAt) return redirect(302, '/dashboard');
	if (!auth.hasFeature('withRegister')) return redirect(302, '/auth/login');
	const verificationResult = await checkVerificationToken(event);

	const verificationCookie = auth.plugins.password.getVerificationCookie(cookies);
	const email = verificationCookie.success ? verificationCookie.data.email : undefined;
	const expiration = verificationCookie.success ? verificationCookie.data.expiration : undefined;
	const timeRemaining = expiration ? expiration.getTime() - Date.now() : 0;
	return {
		email,
		expiration: timeRemaining <= 0 ? undefined : timeRemaining,
		message: verificationResult?.message
	};
};

async function checkVerificationToken(event: PageServerLoadEvent) {
	const {
		locals: { user },
		cookies,
		url,
		getClientAddress,
		request
	} = event;
	const token = url.searchParams.get('token');
	if (!token) return;
	if (user?.emailVerifiedAt) {
		return redirect(302, '/dashboard');
	}
	const verificationResult = await auth.plugins.password.verify({ cookies, token });
	if (!verificationResult.success) {
		return { message: verificationResult.error };
	}
	await auth.session.setSession({
		cookies,
		data: {
			userId: verificationResult.data.user.id,
			ipAddress: getClientAddress() || '0.0.0.0',
			userAgent: request.headers.get('user-agent') || 'Unknown'
		}
	});
	return redirect(302, '/dashboard');
}
