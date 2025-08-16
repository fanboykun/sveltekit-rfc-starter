import { redirect, type RequestEvent } from '@sveltejs/kit';
type AuthenticatedRequest<T extends RequestEvent> = T & {
	locals: T['locals'] & { user: NonNullable<T['locals']['user']> };
};
/**
 * A higher order function that wraps sveltekit load functions
 * to ensure the user is authenticated by checking `locals.user`
 */
export function ensureAuthenticated<Request extends RequestEvent, Output>(
	next: (event: AuthenticatedRequest<Request>) => Promise<Output>
) {
	return async (event: Request): Promise<Output> => {
		const user = event.locals.user;
		if (!user) {
			const authUrl = new URL('/auth/login', event.url);
			authUrl.searchParams.set('redirectTo', event.url.pathname);
			return redirect(302, authUrl.toString());
		}
		return next({ ...event, locals: { ...event.locals, user } });
	};
}
