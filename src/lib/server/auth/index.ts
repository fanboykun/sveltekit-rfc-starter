import { env } from '$env/dynamic/private';
import { AuthInstance } from './core';
import { GoogleProvider } from './providers';
import { RedisSession } from './sessions/redis-session';

export const auth = new AuthInstance({
	config: {
		secret: env.AUTH_SECRET
	},
	provider: {
		google: new GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!
		})
	},
	session: (config) => new RedisSession(config)
});
