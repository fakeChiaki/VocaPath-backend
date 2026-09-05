import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;
