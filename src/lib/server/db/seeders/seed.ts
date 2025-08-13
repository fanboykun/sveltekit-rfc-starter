import { seed } from 'drizzle-seed';
import { db } from '..';
import { users } from '../schema';

async function main() {
	await seed(db, { users });
}
main();
