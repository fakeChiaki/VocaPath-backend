import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { fetchHtml } from '../http.js';
import { parseUstCareerPage, ustCareerUrl } from './ust-career.parser.js';

const PAGE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class UstCareerScraper {
  private readonly logger = new Logger(UstCareerScraper.name);

  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  async run() {
    const startedAt = new Date();
    try {
      const { itemsUpdated, failures } = await this.sync();
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: failures.length > 0 ? 'partial' : 'success',
        startedAt,
        finishedAt: new Date(),
        itemsUpdated,
        errorMessage: failures.length > 0 ? `UST: ${failures.length} páginas fallaron (${failures.slice(0, 3).join(', ')})` : null,
      });
      this.logger.log(`Fichas UST sincronizadas: ${itemsUpdated} carreras actualizadas, ${failures.length} páginas con error`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: `UST: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private async sync() {
    const [ust] = await this.db.select({ id: universities.id }).from(universities).where(eq(universities.name, 'UST')).limit(1);
    if (!ust) throw new Error('La universidad UST no existe: ejecuta antes el scraper de la oferta DEMRE');

    const existing = await this.db.select({ id: careers.id, name: careers.name }).from(careers).where(eq(careers.universityId, ust.id));

    const failures: string[] = [];
    let itemsUpdated = 0;
    for (const career of existing) {
      const url = ustCareerUrl(career.name);
      try {
        const html = await fetchHtml(url);
        const page = html ? parseUstCareerPage(html, url) : null;
        if (!page) {
          this.logger.warn(`"${career.name}": ${url} no existe o no se imparte en Temuco; se omite`);
        } else {
          const fields = { title: page.title, degree: page.degree, duration: page.duration, regimen: page.regimen, curriculumUrl: page.curriculumUrl };
          const set = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null));
          const now = new Date();
          await this.db
            .update(careers)
            .set({ ...set, lastScrapedAt: now, updatedAt: now })
            .where(eq(careers.id, career.id));
          itemsUpdated++;
        }
      } catch (error) {
        failures.push(career.name);
        this.logger.warn(`Falló ${url}: ${error instanceof Error ? error.message : error}`);
      }
      await sleep(PAGE_DELAY_MS);
    }
    return { itemsUpdated, failures };
  }
}
