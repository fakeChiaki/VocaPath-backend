import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { normalizeName, parseUmayorCareerPage, parseUmayorListing, type UmayorCareer } from './umayor-career.parser.js';

const LISTING_URL = 'https://www.admisionmayor.cl/admision-temuco/carreras';
const PAGE_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchHtml(url: string) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

@Injectable()
export class UmayorCareerScraper {
  private readonly logger = new Logger(UmayorCareerScraper.name);

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
        errorMessage: failures.length > 0 ? `UMayor: ${failures.length} páginas fallaron (${failures.slice(0, 3).join(', ')})` : null,
      });
      this.logger.log(`Fichas UMayor sincronizadas: ${itemsUpdated} carreras actualizadas, ${failures.length} páginas con error`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: `UMayor: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  private async fetchCareers() {
    const listing = await fetchHtml(LISTING_URL);
    if (!listing) throw new Error('El listado de carreras de la U. Mayor ya no existe (HTTP 404)');
    const urls = parseUmayorListing(listing);
    if (urls.length === 0) throw new Error('El listado de carreras de la U. Mayor no tiene enlaces: probablemente cambió su formato');

    const pages: UmayorCareer[] = [];
    const failures: string[] = [];
    for (const url of urls) {
      try {
        const html = await fetchHtml(url);
        const career = html ? parseUmayorCareerPage(html, url) : null;
        if (career) pages.push(career);
        else failures.push(url.split('/').pop() ?? url);
      } catch (error) {
        failures.push(url.split('/').pop() ?? url);
        this.logger.warn(`Falló ${url}: ${error instanceof Error ? error.message : error}`);
      }
      await sleep(PAGE_DELAY_MS);
    }
    if (pages.length === 0) throw new Error('Ninguna página de la U. Mayor tenía el bloque de carrera: probablemente cambió su formato');
    return { pages, failures };
  }

  private async persist(pages: UmayorCareer[]) {
    const [umayor] = await this.db.select({ id: universities.id }).from(universities).where(eq(universities.name, 'UMayor')).limit(1);
    if (!umayor) throw new Error('La universidad UMayor no existe: ejecuta antes el scraper de la oferta DEMRE');

    const existing = await this.db
      .select({ id: careers.id, name: careers.name })
      .from(careers)
      .where(eq(careers.universityId, umayor.id));
    const idByName = new Map(existing.map((c) => [normalizeName(c.name), c.id]));

    const now = new Date();
    let updated = 0;
    for (const page of pages) {
      const id = idByName.get(normalizeName(page.name));
      if (!id) {
        this.logger.warn(`"${page.name}" (${page.url}) no coincide con ninguna carrera de la oferta DEMRE; se omite`);
        continue;
      }
      const fields = { title: page.title, degree: page.degree, duration: page.duration, regimen: page.regimen, curriculumUrl: page.curriculumUrl };
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
