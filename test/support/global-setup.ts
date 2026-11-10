import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { ADMIN_DATABASE_URL, TEST_DATABASE_NAME, TEST_DATABASE_URL } from './env.js';

export async function setup() {
  const admin = postgres(ADMIN_DATABASE_URL, { max: 1, onnotice: () => {} });
  const exists = await admin`select 1 from pg_database where datname = ${TEST_DATABASE_NAME}`;
  if (exists.length === 0) await admin.unsafe(`create database "${TEST_DATABASE_NAME}"`);
  await admin.end();

  const client = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });
  await migrate(drizzle(client), { migrationsFolder: './src/database/migrations' });
  await client.end();
}
