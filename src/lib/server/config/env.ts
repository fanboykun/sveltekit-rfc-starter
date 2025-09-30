import z from 'zod';

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
	const env = process.env;
	const result = envSchema.safeParse(env);
	if (!result.success) {
		throw new Error(`Invalid environment variables: ${result.error.message}`);
	}
	return true;
}

export function env<K extends keyof Env>(key: K): Env[K];
export function env<K extends keyof Env>(key: K, defaultValue: Env[K]): Env[K];
export function env<K extends keyof Env>(key: K, defaultValue?: Env[K]): Env[K] {
	validateEnv();
	if (defaultValue) return (process.env[key] as Env[K]) || defaultValue;
	return process.env[key] as Env[K];
}
