import { pgTable, uuid, integer, numeric, timestamp, unique } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';
import { paesSubjectEnum, mencionCienciasEnum } from './enums.js';

export const paesAttempts = pgTable(
  'paes_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subject: paesSubjectEnum('subject').notNull(),
    mencion: mencionCienciasEnum('mencion').notNull().default('ninguna'),
    score: numeric('score', { precision: 6, scale: 2, mode: 'number' }).notNull(),
    correctCount: integer('correct_count').notNull(),
    totalCount: integer('total_count').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userSubjectMencionUnique: unique('paes_attempts_user_subject_mencion_unique').on(
      table.userId,
      table.subject,
      table.mencion,
    ),
  }),
);
