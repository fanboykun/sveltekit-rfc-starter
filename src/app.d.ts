// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from '$lib/server/db/models/user';
import type { UserRoleType } from '$lib/shared/constants/enum';
import type z from 'zod';

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
	export type MaybePromise<T> = T | Promise<T>;
	export type Prettify<T> = { [K in keyof T]: T[K] } & {};

	export type Env = z.infer<(typeof import('$lib/server/config/env'))['envSchema']>;
	export type Schemas = typeof import('$lib/server/db/schema');
	export type Insertable = {
		[K in keyof Schemas as `${Capitalize<SingularWord<K>>}CreateInput`]: {
			[C in keyof InferInsertModel<Schemas[K]>]: InferInsertModel<Schemas[K]>[C] | SQL<unknown>;
		};
	};
	export type Modelable = {
		[K in keyof Schemas as Capitalize<SingularWord<K>>]: InferSelectModel<Schemas[K]>;
	};
	export type Entity = Modelable & Insertable;
	export type EnumSchema = typeof import('$lib/server/db/schema/enums');
	export type Enums = {
		[K in keyof EnumSchema as SplitStr<Capitalize<K>, 'Enum'>]: EnumSchema[K]['enumValues'][number];
	};
	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
		prompt(): Promise<void>;
	}
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}
}

export {};
