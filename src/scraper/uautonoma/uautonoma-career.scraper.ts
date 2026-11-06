import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { fetchHtml } from '../http.js';
import { normalizeCareerName, parseUautonomaCareerPage, parseUautonomaListing, type UautonomaCareer } from './uautonoma-career.parser.js';

const LISTING_URL = 'https://admision.uautonoma.cl/carreras/';
const PAGE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class UautonomaCareerScraper {
  private readonly logger = new Logger(UautonomaCareerScraper.name);

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
        errorMessage: failures.length > 0 ? `UAutónoma: ${failures.length} páginas fallaron (${failures.slice(0, 3).join(', ')})` : null,
      });
      this.logger.log(`Fichas UAutónoma sincronizadas: ${itemsUpdated} carreras actualizadas, ${failures.length} páginas con error`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: `UAutónoma: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private async fetchCareers() {
    const listing = await fetchHtml(LISTING_URL);
    if (!listing) throw new Error('El listado de carreras de la U. Autónoma ya no existe (HTTP 404)');
    const urls = parseUautonomaListing(listing);
    if (urls.length === 0) throw new Error('El listado de carreras de la U. Autónoma no tiene enlaces: probablemente cambió su formato');

    const pages: UautonomaCareer[] = [];
    const failures: string[] = [];
    for (const url of urls) {
      try {
        const html = await fetchHtml(url);
        const career = html ? parseUautonomaCareerPage(html, url) : null;
        if (career) pages.push(career);
      } catch (error) {
        failures.push(url.replace('https://admision.uautonoma.cl/carreras/', '').replace(/\/$/, ''));
        this.logger.warn(`Falló ${url}: ${error instanceof Error ? error.message : error}`);
      }
      await sleep(PAGE_DELAY_MS);
    }
    if (pages.length === 0) throw new Error('Ninguna página de la U. Autónoma tenía sede Temuco: probablemente cambió su formato');
    return { pages, failures };
  }

  private async persist(pages: UautonomaCareer[]) {
    const [uautonoma] = await this.db.select({ id: universities.id }).from(universities).where(eq(universities.name, 'UAutónoma')).limit(1);
    if (!uautonoma) throw new Error('La universidad UAutónoma no existe: ejecuta antes el scraper de la oferta DEMRE');

    const existing = await this.db.select({ id: careers.id, name: careers.name }).from(careers).where(eq(careers.universityId, uautonoma.id));
    const idByName = new Map(existing.map((c) => [normalizeCareerName(c.name), c.id]));

    const now = new Date();
    let updated = 0;
    for (const page of pages) {
      const pageName = normalizeCareerName(page.name);
      const id = idByName.get(pageName) ?? [...idByName].find(([name]) => pageName.startsWith(`${name} con `))?.[1];
      if (!id) {
        this.logger.warn(`"${page.name}" (${page.url}) no coincide con ninguna carrera de la oferta DEMRE; se omite`);
        continue;
      }
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
      await this.db
        .update(careers)
        .set({ ...set, lastScrapedAt: now, updatedAt: now })
        .where(eq(careers.id, id));
      updated++;
    }
    return updated;
  }
}
