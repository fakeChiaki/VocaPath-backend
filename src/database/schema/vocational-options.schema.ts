import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';
import { vocationalQuestions } from './vocational-questions.schema.js';
import { areas } from './areas.schema.js';

export const vocationalOptions = pgTable('vocational_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id')
    .notNull()
    .references(() => vocationalQuestions.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  areaCode: text('area_code')
    .notNull()
    .references(() => areas.code),
  position: integer('position').notNull(),
});
