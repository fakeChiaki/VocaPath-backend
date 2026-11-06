import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { fetchHtml } from '../http.js';
import { parseUctCareerPage, parseUctListing, type UctCareer } from './uct-career.parser.js';

const LISTING_URL = 'https://admision.uct.cl/carreras/';
const PAGE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class UctCareerScraper {
  private readonly logger = new Logger(UctCareerScraper.name);

  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  async run() {
    const startedAt = new Date();
    try {
      const { pages, failures } = await this.fetchCareers();
      const itemsUpdated = await this.persist(pages);
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: failures.length > 0 ? 'partial' : 'success',
        startedAt,
        finishedAt: new Date(),
        itemsUpdated,
        errorMessage: failures.length > 0 ? `UCT: ${failures.length} páginas fallaron (${failures.slice(0, 3).join(', ')})` : null,
      });
      this.logger.log(`Fichas UCT sincronizadas: ${itemsUpdated} carreras actualizadas, ${failures.length} páginas con error`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: `UCT: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private async fetchCareers() {
    const listing = await fetchHtml(LISTING_URL);
    if (!listing) throw new Error('El listado de carreras de la UCT ya no existe (HTTP 404)');
    const urls = parseUctListing(listing);
    if (urls.length === 0) throw new Error('El listado de carreras de la UCT no tiene enlaces: probablemente cambió su formato');

    const pages: UctCareer[] = [];
    const failures: string[] = [];
    for (const url of urls) {
      try {
        const html = await fetchHtml(url);
        if (html) pages.push(...parseUctCareerPage(html, url));
      } catch (error) {
        failures.push(url.replace('https://admision.uct.cl/', '').replace(/\/$/, ''));
        this.logger.warn(`Falló ${url}: ${error instanceof Error ? error.message : error}`);
      }
      await sleep(PAGE_DELAY_MS);
    }
    if (pages.length === 0) throw new Error('Ninguna página de la UCT tenía el bloque de carrera: probablemente cambió su formato');
    return { pages, failures };
  }

  private async persist(pages: UctCareer[]) {
    const [uct] = await this.db.select({ id: universities.id }).from(universities).where(eq(universities.name, 'UCT')).limit(1);
    if (!uct) throw new Error('La universidad UCT no existe: ejecuta antes el scraper de la oferta DEMRE');

    const now = new Date();
    let updated = 0;
    for (const page of pages) {
      const fields = { title: page.title, degree: page.degree, duration: page.duration, regimen: page.regimen, profile: page.profile };
      const set = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null));
      const rows = await this.db
        .update(careers)
        .set({ ...set, lastScrapedAt: now, updatedAt: now })
        .where(and(eq(careers.universityId, uct.id), eq(careers.externalCode, page.code)))
        .returning({ id: careers.id });
      if (rows.length === 0) this.logger.debug(`Código ${page.code} (${page.url}) no existe en la oferta DEMRE de Temuco; se omite`);
      updated += rows.length;
    }
    return updated;
  }
}
