import { eq } from 'drizzle-orm';
import { db as _db, type Db } from '..';
import * as schema from '../schema';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { BaseModel } from './base';

export type User = InferSelectModel<typeof schema.users>;
export type UserCreateInput = InferInsertModel<typeof schema.users>;
export type UserUpdateInput = Partial<User>;

export class UserModel extends BaseModel {
	constructor(db: Db = _db) {
		super(db);
	}

	async findByEmail(email: string) {
		return await this.try(async () => {
			const [result] = await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email))
				.limit(1);
			return result;
		});
	}

	async findById(id: string) {
		return await this.try(async () => {
			const [result] = await this.db
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, id))
				.limit(1);
			return result;
		});
	}

	async create(user: UserCreateInput) {
		return await this.try(async () => {
			const [result] = await this.db.insert(schema.users).values(user).returning();
			return result;
		});
	}

	async update(id: string, user: UserUpdateInput) {
		return await this.try(async () => {
			const [result] = await this.db
				.update(schema.users)
				.set(user)
				.where(eq(schema.users.id, id))
				.returning();
			return result;
		});
	}

	async delete(id: string) {
		return await this.try(async () => {
			const [result] = await this.db
				.delete(schema.users)
				.where(eq(schema.users.id, id))
				.returning();
			return result;
		});
	}

	async upsert(user: UserCreateInput) {
		return await this.try(async () => {
			const [result] = await this.db
				.insert(schema.users)
				.values(user)
				.onConflictDoUpdate({
					target: schema.users.id,
					set: user
				})
				.returning();
			return result;
		});
	}

	async upsertByEmail(user: UserCreateInput) {
		return await this.try(async () => {
			const [result] = await this.db
				.insert(schema.users)
				.values(user)
				.onConflictDoUpdate({
					target: schema.users.email,
					set: user
				})
				.returning();
			return result;
		});
	}

	async checkEmail(email: string) {
		return this.one(async () =>
			this.db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1)
		);
	}
}
