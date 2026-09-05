import { pgTable, text } from 'drizzle-orm/pg-core';

export const areas = pgTable('areas', {
  code: text('code').primaryKey(),
  label: text('label').notNull(),
});
