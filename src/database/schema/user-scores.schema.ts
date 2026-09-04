import { pgTable, uuid, numeric, timestamp, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema.js';
import { scoreFactorEnum, scoreSourceEnum } from './enums.js';
import { paesAttempts } from './paes-attempts.schema.js';

export const userScores = pgTable(
  'user_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    factor: scoreFactorEnum('factor').notNull(),
    value: numeric('value', { precision: 6, scale: 2 }).notNull(),
    source: scoreSourceEnum('source').notNull(),
    attemptId: uuid('attempt_id').references(() => paesAttempts.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userFactorUnique: unique('user_scores_user_factor_unique').on(table.userId, table.factor),
    valueRange: check('user_scores_value_range', sql`${table.value} >= 100 AND ${table.value} <= 1000`),
  }),
);
