import { pgTable, uuid, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { paesSubjectEnum, mencionCienciasEnum } from './enums.js';

export const paesQuestions = pgTable('paes_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subject: paesSubjectEnum('subject').notNull(),
  mencion: mencionCienciasEnum('mencion').notNull().default('ninguna'),
  text: text('text').notNull(),
  options: jsonb('options').$type<string[]>().notNull(),
  correctIndex: integer('correct_index').notNull(),
});
