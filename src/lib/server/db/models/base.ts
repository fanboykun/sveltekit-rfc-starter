import type { Db } from '..';

export class BaseModel {
	constructor(protected db: Db) {}
	/**
	 * Wrap everything in try catch, null if error
	 * @param q
	 * @returns
	 */
	protected async try<T>(q: () => Promise<T>) {
		try {
			return await q();
		} catch (error) {
			console.error('BaseModel.try', error);
			return null;
		}
	}

	/**
	 * This wrapper wrap result and return the first result
	 * Drizzle returns every result it array
	 * Wrap everything in try catch, null if error
	 * @param q
	 * @returns
	 */
	protected async one<T>(q: () => Promise<T[]>) {
		return await this.try(async () => {
			const [result] = await q();
			return result;
		});
	}
}
