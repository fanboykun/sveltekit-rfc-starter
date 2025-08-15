import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type ServerInit } from '@sveltejs/kit';
import redis from '$lib/server/redis/redis';
import { auth } from '$lib/server/auth';
import { Models } from '$lib/server/db/models';

export const init: ServerInit = async () => {
	await redis.connect();
};
const setTraceId: Handle = async ({ resolve, event }) => {
	event.locals.traceId = crypto.randomUUID();
	return resolve(event);
};

const setUser: Handle = async ({ resolve, event }) => {
	const session = await auth.session.getSession({
		cookies: event.cookies
	});
	if (!session) return resolve(event);
	const user = await new Models.User().findById(session.userId);
	if (!user) return resolve(event);
	return resolve({ ...event, locals: { ...event.locals, user } });
};

export const handle: Handle = sequence(setTraceId, setUser);
