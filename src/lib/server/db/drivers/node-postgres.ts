import { env } from '$lib/server/config/env';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import { building } from '$app/environment';

export function getDatabase() {
	const DATABASE_URL = building ? process.env.DATABASE_URL! : env('DATABASE_URL');
	const client = new Pool({ connectionString: DATABASE_URL });

	return drizzle(client, { schema });
}
