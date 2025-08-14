import { env } from '$env/dynamic/private';
import { AuthInstance } from './instances/instance';
import { GoogleProvider } from './providers/google';

export const auth = new AuthInstance({
	provider: {
		google: new GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID!,
			clientSecret: env.GOOGLE_CLIENT_SECRET!
		})
	}
});
