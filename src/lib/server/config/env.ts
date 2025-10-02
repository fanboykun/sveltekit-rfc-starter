import z from 'zod';
import * as appEnv from '$env/dynamic/private';
import { building } from '$app/environment';

export const envSchema = z.object({
	APP_NAME: z.string().min(1),
	DATABASE_URL: z.string().min(1),
	REDIS_URL: z.string().min(1),
	AUTH_SECRET: z.string().min(1),
	MOCK_LOGIN: z
		.string()
		.min(1)
		.transform((val) => val.toLowerCase() === 'true'),
	GOOGLE_CLIENT_ID: z.string().min(1),
	GOOGLE_CLIENT_SECRET: z.string().min(1),
	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	FACEBOOK_CLIENT_ID: z.string().min(1),
	FACEBOOK_CLIENT_SECRET: z.string().min(1)
});
export function validateEnv() {
	// Skip validation during build time
	if (building) {
		return true;
	}

	const env = process.env ?? appEnv;
	const result = envSchema.safeParse(env);
	if (!result.success) {
		throw new Error(`Invalid environment variables: ${result.error.message}`);
	}
	return true;
}

export function env<K extends keyof Env>(key: K): Env[K];
export function env<K extends keyof Env>(key: K, defaultValue: Env[K]): Env[K];
export function env<K extends keyof Env>(key: K, defaultValue?: Env[K]): Env[K] {
	// Only validate env during runtime, not build time
	if (!building) {
		validateEnv();
	}

	if (defaultValue) return (process.env[key] as Env[K]) || defaultValue;
	return process.env[key] as Env[K];
}
