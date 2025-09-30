import { env } from '../config/env';
import { AuthInstance } from './core';
import { PasswordPlugin } from './plugins/password';
import { GithubProvider, GoogleProvider } from './providers';
// import { RedisSession } from './sessions/redis-session';
import { DatabaseSession } from './sessions/database-session';

/**
 * Auth module entry.
 *
 * Usage:
 * - Call `auth.getAuthenticationUrl('<provider>', { cookies, url })` to start OAuth and redirect the user.
 * - In the callback route, call `auth.getAuthenticatedUser('<provider>', { cookies, url })` to complete the flow.
 * - Session is backed by Redis via `RedisSession` and signed with `AUTH_SECRET`.
 *
 * Environment variables required:
 * - AUTH_SECRET — cookie signing secret
 * - GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET — Google OAuth credentials (if enabled)
 * - GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET — GitHub OAuth credentials (if enabled)
 *
 * Add a new OAuth provider (high level steps):
 * 1) Create a provider adapter in `src/lib/server/auth/providers/<provider>.ts` implementing the Provider interface.
 * 2) Export it from `src/lib/server/auth/providers/index.ts`.
 * 3) Register it below in the `provider` map with its `clientId` and `clientSecret`.
 * 4) Add `<provider>` to the route param matcher in `src/params/auth_provider.ts` so callbacks are accepted.
 * 4a) Update the client-safe enum in `src/lib/shared/constants/enum.ts` (`AuthProvider`) so client code stays in sync.
 * 5) Add `<PROVIDER>_CLIENT_ID` and `<PROVIDER>_CLIENT_SECRET` to `.env`.
 * 6) Update UI (e.g., login page/button) to pass the new provider key when invoking the login remote function.
 */
export const auth = new AuthInstance({
	config: {
		secret: env('AUTH_SECRET')
	},
	provider: {
		google: new GoogleProvider({
			clientId: env('GOOGLE_CLIENT_ID'),
			clientSecret: env('GOOGLE_CLIENT_SECRET')
		}),
		github: new GithubProvider({
			clientId: env('GITHUB_CLIENT_ID'),
			clientSecret: env('GITHUB_CLIENT_SECRET')
		})
	},
	// session: (config) => new RedisSession(config),
	session: (config) => new DatabaseSession(config),
	plugins: {
		password: new PasswordPlugin()
	}
});
/**
 * List of all applied providers.
 * When you make change to providers (add new provider or remove existing provider) this type will be updated automatically.
 * But you have to update the enum in `src/lib/shared/constants/enum.ts` (`AuthProvider`) so client code stays in sync.
 */
export type AppliableProvider = ReturnType<typeof auth.getAvailableProviders>[number];
