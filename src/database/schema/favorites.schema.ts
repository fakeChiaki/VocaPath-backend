import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { careers } from './careers.schema.js';

export const userFavorites = pgTable(
  'user_favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    careerId: uuid('career_id')
      .notNull()
      .references(() => careers.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.careerId] }),
  }),
);
