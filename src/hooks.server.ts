import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type ServerInit } from '@sveltejs/kit';
import redis from '$lib/server/redis/redis';
import { auth } from '$lib/server/auth/auth';

export const init: ServerInit = async () => {
	await redis.connect();
};
const setTraceId: Handle = async ({ resolve, event }) => {
	event.locals.traceId = crypto.randomUUID();
	return resolve(event);
};

const setUser: Handle = async ({ resolve, event }) => {
	const session = await auth.session.getSession({
		redis,
		cookies: event.cookies
	});
	if (!session) return resolve(event);
	return resolve({ ...event, locals: { ...event.locals, user: { id: session.userId } } });
};

export const handle: Handle = sequence(setTraceId, setUser);
