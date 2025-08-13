import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { AuthInstance } from './instances/instance';
import { GoogleProvider } from './providers/google';

export const auth = new AuthInstance({
	provider: {
		google: new GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!
		})
	},
	session: {
		name: 'auth_session',
		ttl: 60 * 60 * 24 * 7 // 1 week
	},
	cookie: {
		secure: !dev, // set to false in localhost
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 min
		sameSite: 'lax'
	}
});
