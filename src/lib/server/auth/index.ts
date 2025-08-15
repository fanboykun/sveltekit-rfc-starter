import { env } from '$env/dynamic/private';
import { AuthInstance } from './core';
import { GithubProvider, GoogleProvider } from './providers';
import { RedisSession } from './sessions/redis-session';

export const auth = new AuthInstance({
	config: {
		secret: env.AUTH_SECRET
	},
	provider: {
		google: new GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!
		}),
		github: new GithubProvider({
			clientId: env.GITHUB_CLIENT_ID!,
			clientSecret: env.GITHUB_CLIENT_SECRET!
		})
	},
	session: (config) => new RedisSession(config)
});
