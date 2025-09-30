import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		email: text('email').notNull().unique(),
		image: text('image'),
		name: text('name').notNull(),
		provider: text('provider').notNull(),
		userRole: userRoleEnum('user_role').default('user').notNull(),
		password: text('password'),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$defaultFn(() => new Date())
			.notNull()
	},
	(table) => [index('provider_idx').on(table.provider), index('user_role_idx').on(table.userRole)]
);
