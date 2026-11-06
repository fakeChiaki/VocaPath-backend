import { Inject, Injectable, Logger } from '@nestjs/common';
import { notInArray, sql } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { paesDates, scrapeRuns } from '../../database/schema/index.js';
import { buildPaesDates, parseCalendarEvents } from './demre-calendar.parser.js';
import { download } from './download.js';

export const DEMRE_CALENDAR_URL = 'https://demre.cl/calendario';

@Injectable()
export class DemreCalendarScraper {
  private readonly logger = new Logger(DemreCalendarScraper.name);

  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  async run() {
    const startedAt = new Date();
    try {
      const html = Buffer.from(await download(DEMRE_CALENDAR_URL)).toString('utf8');
      const { dates, missing } = buildPaesDates(parseCalendarEvents(html), new Date().toISOString().slice(0, 10));
      if (dates.length === 0) throw new Error('El calendario de DEMRE no produjo ninguna fecha: probablemente cambió su formato');

      const itemsUpdated = await this.persist(dates, missing.length === 0);
      await this.db.insert(scrapeRuns).values({
        target: 'paes_dates',
        status: missing.length > 0 ? 'partial' : 'success',
        startedAt,
        finishedAt: new Date(),
        itemsUpdated,
        errorMessage: missing.length > 0 ? `Calendario DEMRE: no se encontraron ${missing.join(', ')}` : null,
      });
      this.logger.log(`Calendario DEMRE sincronizado: ${itemsUpdated} fechas${missing.length > 0 ? `, faltan: ${missing.join(', ')}` : ''}`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'paes_dates',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private persist(dates: ReturnType<typeof buildPaesDates>['dates'], complete: boolean) {
    const now = new Date();
    return this.db.transaction(async (tx) => {
      const rows = await tx
        .insert(paesDates)
        .values(dates.map((d) => ({ ...d, sourceUrl: DEMRE_CALENDAR_URL, lastScrapedAt: now })))
        .onConflictDoUpdate({
          target: [paesDates.phase, paesDates.title],
          set: {
            dateStart: sql`excluded.date_start`,
            dateEnd: sql`excluded.date_end`,
            dateLabel: sql`excluded.date_label`,
            status: sql`excluded.status`,
            icon: sql`excluded.icon`,
            sourceUrl: sql`excluded.source_url`,
            lastScrapedAt: sql`excluded.last_scraped_at`,
          },
        })
        .returning({ id: paesDates.id });
      if (complete) {
        await tx.delete(paesDates).where(
          notInArray(
            paesDates.id,
            rows.map((r) => r.id),
          ),
        );
      }
      return rows.length;
    });
  }
}
