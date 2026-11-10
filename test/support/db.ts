import postgres from 'postgres';
import { TEST_DATABASE_URL } from './env.js';

export async function resetDatabase() {
  const sql = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });
  try {
    const tables = await sql<{ tablename: string }[]>`select tablename from pg_tables where schemaname = 'public'`;
    const list = tables.map((t) => `"${t.tablename}"`).join(', ');
    await sql.unsafe(`truncate ${list} restart identity cascade`);
  } finally {
    await sql.end();
  }
}
