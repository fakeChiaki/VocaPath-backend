import { pgTable, uuid, text, integer, numeric, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { universities } from './universities.schema.js';
import { areas } from './areas.schema.js';

export interface CareerWeights {
  nem: number;
  ranking: number;
  lectora: number;
  matematica: number;
  historia: number;
  ciencias: number;
}

export const careers = pgTable(
  'careers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    universityId: uuid('university_id')
      .notNull()
      .references(() => universities.id, { onDelete: 'cascade' }),
    areaCode: text('area_code')
      .notNull()
      .references(() => areas.code),
    externalCode: text('external_code').notNull(),
    name: text('name').notNull(),
    title: text('title').notNull(),
    degree: text('degree').notNull(),
    duration: text('duration').notNull(),
    regimen: text('regimen').notNull(),
    vacantes: integer('vacantes').notNull(),
    firstSelectedScore: numeric('first_selected_score', { precision: 6, scale: 2, mode: 'number' }),
    cutoffScore: numeric('cutoff_score', { precision: 6, scale: 2, mode: 'number' }),
    profile: text('profile').notNull(),
    weights: jsonb('weights').$type<CareerWeights>().notNull(),
    sourceUrl: text('source_url').notNull(),
    lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    universityExternalCodeUnique: unique('careers_university_external_code_unique').on(
      table.universityId,
      table.externalCode,
    ),
  }),
);
