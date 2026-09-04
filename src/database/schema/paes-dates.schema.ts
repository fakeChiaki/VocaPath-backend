import { pgTable, uuid, text, date, timestamp } from 'drizzle-orm/pg-core';
import { paesDateStatusEnum } from './enums.js';

export const paesDates = pgTable('paes_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  phase: text('phase').notNull(),
  title: text('title').notNull(),
  dateStart: date('date_start'),
  dateEnd: date('date_end'),
  dateLabel: text('date_label').notNull(),
  status: paesDateStatusEnum('status').notNull(),
  icon: text('icon').notNull(),
  sourceUrl: text('source_url').notNull(),
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
});
