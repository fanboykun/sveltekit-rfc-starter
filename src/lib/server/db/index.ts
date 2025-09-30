import { getDatabase } from './drivers/node-postgres';

export const db = getDatabase();
type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db | Trx;

export async function transaction<T>(fn: (trx: Trx) => Promise<T>) {
	return await db.transaction(fn);
}
