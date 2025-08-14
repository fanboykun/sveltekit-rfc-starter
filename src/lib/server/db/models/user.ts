import { eq } from 'drizzle-orm';
import { db as _db, type Db } from '..';
import * as schema from '../schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof schema.users>;
export type UserCreateInput = InferInsertModel<typeof schema.users>;
export type UserUpdateInput = Partial<User>;

export class UserModel {
	constructor(private db: Db = _db) {}

	private async try<T>(q: () => Promise<T>) {
		try {
			return await q();
		} catch (error) {
			console.error('UserModel.try', error);
			return null;
		}
	}

	async findByEmail(email: string) {
		return await this.try(
			async () =>
				await this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
		);
	}

	async findById(id: string) {
		return await this.try(
			async () => await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1)
		);
	}

	async create(user: UserCreateInput) {
		return await this.try(() => this.db.insert(schema.users).values(user).returning());
	}

	async update(id: string, user: UserUpdateInput) {
		return await this.try(() =>
			this.db.update(schema.users).set(user).where(eq(schema.users.id, id)).returning()
		);
	}

	async delete(id: string) {
		return await this.try(() =>
			this.db.delete(schema.users).where(eq(schema.users.id, id)).returning()
		);
	}

	async upsert(user: UserCreateInput) {
		return await this.try(() =>
			this.db
				.insert(schema.users)
				.values(user)
				.onConflictDoUpdate({
					target: schema.users.id,
					set: user
				})
				.returning()
		);
	}

	async upsertByEmail(user: UserCreateInput) {
		return await this.try(() =>
			this.db
				.insert(schema.users)
				.values(user)
				.onConflictDoUpdate({
					target: schema.users.email,
					set: user
				})
				.returning()
		);
	}
}

_db.transaction(async (tx) => {
	new UserModel(tx).findById('aayayaya');
});
