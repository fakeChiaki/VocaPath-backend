import { pgTable, uuid, text, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { paesSubjectEnum, mencionCienciasEnum } from './enums.js';

export const paesQuestions = pgTable(
  'paes_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subject: paesSubjectEnum('subject').notNull(),
    mencion: mencionCienciasEnum('mencion').notNull().default('ninguna'),
    text: text('text').notNull(),
    options: jsonb('options').$type<string[]>().notNull(),
    correctIndex: integer('correct_index').notNull(),
  },
  (table) => ({
    subjectMencionTextUnique: unique('paes_questions_subject_mencion_text_unique').on(
      table.subject,
      table.mencion,
      table.text,
    ),
  }),
);
