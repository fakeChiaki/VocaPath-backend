import { pgTable, uuid, integer } from 'drizzle-orm/pg-core';
import { paesAttempts } from './paes-attempts.schema.js';
import { paesQuestions } from './paes-questions.schema.js';

export const paesAttemptAnswers = pgTable('paes_attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => paesAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => paesQuestions.id, { onDelete: 'cascade' }),
  selectedIndex: integer('selected_index').notNull(),
});
