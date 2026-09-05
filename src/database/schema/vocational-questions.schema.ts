import { pgTable, uuid, text, integer, unique } from 'drizzle-orm/pg-core';

export const vocationalQuestions = pgTable(
  'vocational_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text').notNull(),
    position: integer('position').notNull(),
  },
  (table) => ({
    textUnique: unique('vocational_questions_text_unique').on(table.text),
  }),
);
