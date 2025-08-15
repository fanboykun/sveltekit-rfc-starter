// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from '$lib/server/db/models/user';
import type { UserRoleType } from '$lib/shared/enums/enum';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			traceId: string;
			error?: Record<string, string[] | undefined>;
		}
		interface Locals {
			traceId: string;
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	export type SafeUser = {
		id: string;
		name: string;
		email: string;
		image: string | null;
		userRole: UserRoleType;
	};
}

export {};
