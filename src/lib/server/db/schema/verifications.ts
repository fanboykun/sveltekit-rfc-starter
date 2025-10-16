import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const verifications = pgTable('verifications ', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id').notNull(),
	email: text('email').unique().notNull(),
	token: text('token').unique().notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$defaultFn(() => new Date())
		.notNull()
});
