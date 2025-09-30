import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { UserRoleType as Role } from '$lib/shared/constants/enum';

export type AuthenticatedRequest<T extends RequestEvent = RequestEvent> = T & {
	locals: T['locals'] & { user: NonNullable<T['locals']['user']> };
};
export type AuthenticatedRequestWithRole<
	R extends [Role, ...Role[]],
	T extends RequestEvent = RequestEvent
> = Prettify<
	Omit<T, 'locals'> & {
		locals: Prettify<
			Omit<T['locals'], 'user'> & {
				user: Prettify<
					Omit<NonNullable<T['locals']['user']>, 'userRole'> & { userRole: R[number] }
				>;
			}
		>;
	}
>;
/**
 * A higher order function that wraps sveltekit load functions
 * to ensure the user is authenticated by checking `locals.user`
 */
// Overload for role-based authentication
export function ensureAuthenticated<
	Request extends RequestEvent,
	R extends [Role, ...Role[]],
	Output
>(
	role: R,
	next: (event: AuthenticatedRequestWithRole<R, Request>) => MaybePromise<Output>
): (event: Request) => Promise<Output>;

// Overload for basic authentication
export function ensureAuthenticated<Request extends RequestEvent, Output>(
	next: (event: AuthenticatedRequest<Request>) => MaybePromise<Output>
): (event: Request) => Promise<Output>;

// Implementation
export function ensureAuthenticated<
	Request extends RequestEvent,
	R extends [Role, ...Role[]],
	Output
>(
	roleOrNext: R | ((event: AuthenticatedRequest<Request>) => MaybePromise<Output>),
	next?: (event: AuthenticatedRequestWithRole<R, Request>) => MaybePromise<Output>
): (event: Request) => Promise<Output> {
	return async (event: Request): Promise<Output> => {
		const user = event.locals.user;
		if (!user) {
			const authUrl = new URL('/auth/login', event.url);
			authUrl.searchParams.set('redirectTo', event.url.pathname);
			return redirect(302, authUrl.toString());
		}

		// If first parameter is an array of roles
		if (Array.isArray(roleOrNext)) {
			if (!roleOrNext.includes(user.userRole)) {
				return redirect(302, '/');
			}
			// Call the next function with role-typed event
			return next!({ ...event, locals: { ...event.locals, user } } as AuthenticatedRequestWithRole<
				R,
				Request
			>);
		} else {
			// Call the function directly (no role check)
			const fn = roleOrNext as (event: AuthenticatedRequest<Request>) => MaybePromise<Output>;
			return fn({ ...event, locals: { ...event.locals, user } });
		}
	};
}
