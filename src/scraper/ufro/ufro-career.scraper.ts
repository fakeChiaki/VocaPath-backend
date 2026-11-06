import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import * as cheerio from 'cheerio';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { fetchHtml } from '../http.js';
import { parseUfroCareerPage, type UfroCareer } from './ufro-career.parser.js';

const LISTING_URL = 'https://admision.ufro.cl/carreras-temuco/';
const PAGE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class UfroCareerScraper {
  private readonly logger = new Logger(UfroCareerScraper.name);

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
        errorMessage: failures.length > 0 ? `UFRO: ${failures.length} páginas fallaron (${failures.slice(0, 3).join(', ')})` : null,
      });
      this.logger.log(`Fichas UFRO sincronizadas: ${itemsUpdated} carreras actualizadas, ${failures.length} páginas con error`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: `UFRO: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private async fetchCareers() {
    const listing = await fetchHtml(LISTING_URL);
    if (!listing) throw new Error('El listado de carreras de la UFRO ya no existe (HTTP 404)');
    const $ = cheerio.load(listing);
    const urls = new Set<string>();
    $('a[href]').each((_, a) => {
      const href = $(a).attr('href') ?? '';
      if (/^https:\/\/admision\.ufro\.cl\/[a-z0-9-]+\/?$/.test(href) && href !== LISTING_URL) urls.add(href);
    });
    if (urls.size === 0) throw new Error('El listado de carreras de la UFRO no tiene enlaces: probablemente cambió su formato');

    const pages: UfroCareer[] = [];
    const failures: string[] = [];
    for (const url of urls) {
      try {
        const html = await fetchHtml(url);
        const career = html ? parseUfroCareerPage(html, url) : null;
        if (career) pages.push(career);
      } catch (error) {
        failures.push(url.replace('https://admision.ufro.cl/', '').replace(/\/$/, ''));
        this.logger.warn(`Falló ${url}: ${error instanceof Error ? error.message : error}`);
      }
      await sleep(PAGE_DELAY_MS);
    }
    if (pages.length === 0) throw new Error('Ninguna página de la UFRO tenía el bloque de carrera: probablemente cambió su formato');
    return { pages, failures };
  }

  private async persist(pages: UfroCareer[]) {
    const [ufro] = await this.db.select({ id: universities.id }).from(universities).where(eq(universities.name, 'UFRO')).limit(1);
    if (!ufro) throw new Error('La universidad UFRO no existe: ejecuta antes el scraper de la oferta DEMRE');

    const now = new Date();
    let updated = 0;
    for (const page of pages) {
      const fields = {
        title: page.title,
        degree: page.degree,
        duration: page.duration,
        regimen: page.regimen,
        firstSelectedScore: page.firstSelectedScore,
        cutoffScore: page.cutoffScore,
        curriculumUrl: page.curriculumUrl,
      };
      const set = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null));

      for (const code of page.codes) {
        const rows = await this.db
          .update(careers)
          .set({ ...set, lastScrapedAt: now, updatedAt: now })
          .where(and(eq(careers.universityId, ufro.id), eq(careers.externalCode, code)))
          .returning({ id: careers.id });
        if (rows.length === 0) this.logger.warn(`Código ${code} (${page.url}) no existe en la oferta DEMRE; se omite`);
        updated += rows.length;
      }
    }
    return updated;
  }
}
