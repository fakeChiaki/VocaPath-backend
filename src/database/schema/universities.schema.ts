import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const universities = pgTable('universities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  city: text('city').notNull(),
  color: text('color').notNull(),
  websiteUrl: text('website_url').notNull(),
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
