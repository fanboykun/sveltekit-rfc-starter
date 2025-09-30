import { sequence } from '@sveltejs/kit/hooks';
import { type Handle, type HandleValidationError, type ServerInit } from '@sveltejs/kit';
import redis from '$lib/server/redis/redis';
import { auth } from '$lib/server/auth';
import { Models } from '$lib/server/db/models';
import { db } from '$lib/server/db';
import { validateEnv } from '$lib/server/config/env';

/**
 * Test connection to Redis and Postgres
 * Will only run once the server initializes.
 * You Might change or even disabled it depending on you adapter
 */
export const init: ServerInit = async () => {
	await redis.connect();
	await db.$client.connect().then(() => console.log('Successfully connected to Postgres'));
	if (validateEnv()) console.log('Env validated');

	// This only available on adapter-node
	process.on('sveltekit:shutdown', async () => {
		await redis.disconnect();
		await db.$client.end();
	});
};

/**
 * Usefull for tracing requests
 */
const setTraceId: Handle = async ({ resolve, event }) => {
	event.locals.traceId = crypto.randomUUID();
	return resolve(event);
};

/**
 * Set user in locals if session is valid
 */
const setUser: Handle = async ({ resolve, event }) => {
	const session = await auth.session.getSession({
		cookies: event.cookies
	});
	if (!session) return resolve(event);
	const user = await new Models.User().findById(session.userId);
	if (!user) return resolve(event);
	event.locals.user = user;
	return resolve(event);
};

export const handleValidationError: HandleValidationError = ({ issues, event }) => {
	return {
		message: 'Invalid Payload',
		traceId: event.locals.traceId,
		error: issues.reduce(
			(acc, issue) => {
				acc[issue.path?.join('.') || ''] = [issue.message];
				return acc;
			},
			{} as Record<string, string[]>
		)
	};
};
export const handle: Handle = sequence(setTraceId, setUser);
