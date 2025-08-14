import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(client, { schema });
type Trx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db | Trx;

export async function transaction<T>(fn: (trx: Trx) => Promise<T>) {
	return await db.transaction(fn);
}
