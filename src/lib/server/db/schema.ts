import { pgTable, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: integer('id').primaryKey(),
	age: integer('age')
});
