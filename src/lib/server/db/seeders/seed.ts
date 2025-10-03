import { hash } from 'bcryptjs';
import { users } from '../schema';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

async function main() {
	// need improvement,
	const client = new Pool({ connectionString: process.env.DATABASE_URL! });
	const db = drizzle(client, { schema: { users } });

	try {
		if (process.env.NODE_ENV === 'production')
			throw new Error('This script is only for development environment');
		const [existingUser] = await db
			.select()
			.from(users)
			.where(eq(users.email, 'admin@admin.com'))
			.limit(1);
		if (existingUser) return;
		const password = 'Admin123';
		if (!password) throw new Error('DEFAULT_PASSWORD is not set');
		const hashedPassword = await hash(password, 12);
		await db.insert(users).values({
			email: 'admin@admin.com',
			password: hashedPassword,
			name: 'Admin',
			userRole: 'admin',
			provider: 'password'
		});
	} finally {
		await db.$client.end();
	}
}
main()
	.then(() => {
		console.log('Seeding completed');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Seeding failed', error);
		process.exit(1);
	});
