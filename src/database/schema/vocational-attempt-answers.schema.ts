import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { vocationalAttempts } from './vocational-attempts.schema.js';
import { vocationalQuestions } from './vocational-questions.schema.js';
import { vocationalOptions } from './vocational-options.schema.js';

export const vocationalAttemptAnswers = pgTable('vocational_attempt_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  attemptId: uuid('attempt_id')
    .notNull()
    .references(() => vocationalAttempts.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => vocationalQuestions.id, { onDelete: 'cascade' }),
  optionId: uuid('option_id')
    .notNull()
    .references(() => vocationalOptions.id, { onDelete: 'cascade' }),
});
