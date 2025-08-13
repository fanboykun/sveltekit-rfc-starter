import { auth } from '$lib/server/auth/auth';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import redis from '$lib/server/redis/redis';

export const POST = async (event: RequestEvent) => {
	await auth.session.deleteSession({
		redis,
		cookies: event.cookies
	});
	return redirect(302, '/');
};
