import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';

export const vocationalQuestions = pgTable('vocational_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  position: integer('position').notNull(),
});
