// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from '$lib/server/db/models/user';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			traceId: string;
		}
		interface Locals {
			traceId: string;
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
