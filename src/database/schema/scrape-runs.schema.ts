import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { scrapeTargetEnum, scrapeStatusEnum } from './enums.js';

export const scrapeRuns = pgTable('scrape_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  target: scrapeTargetEnum('target').notNull(),
  status: scrapeStatusEnum('status').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  itemsUpdated: integer('items_updated').notNull().default(0),
  errorMessage: text('error_message'),
});
