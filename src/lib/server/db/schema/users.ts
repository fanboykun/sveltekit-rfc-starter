import { pgTable, text, uuid, timestamp, index } from 'drizzle-orm/pg-core';
import { authProviderEnum, userRoleEnum } from './enums';

export const users = pgTable(
	'users',
	{
		id: uuid('id').primaryKey(),
		email: text('email').notNull().unique(),
		image: text('image'),
		name: text('name').notNull(),
		provider: authProviderEnum('provider').notNull(),
		userRole: userRoleEnum('user_role').default('user').notNull(),
		accessToken: text('access_token').notNull(),
		refreshToken: text('refresh_token'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull()
	},
	(table) => [index('provider_idx').on(table.provider), index('user_role_idx').on(table.userRole)]
);
