import https from 'node:https';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../../database/database.constants.js';
import type { DrizzleDb } from '../../database/database.types.js';
import { careers, scrapeRuns, universities } from '../../database/schema/index.js';
import { parseDemreOffer, type DemreOfferRow, type UniversityKey } from './demre-offer.parser.js';
import { areaFor } from '../area.js';
import { titleCase } from '../text.js';
import { readPdfPages } from './pdf-pages.js';

export const DEMRE_OFFER_PDF_URL = 'https://demre.cl/publicaciones/pdf/2027-26-09-24-oferta-definitiva-carreras-p2027.pdf';

const UNIVERSITIES: Record<UniversityKey, { name: string; fullName: string; color: string; websiteUrl: string }> = {
  ufro: { name: 'UFRO', fullName: 'Universidad de La Frontera', color: '#2563eb', websiteUrl: 'https://www.ufro.cl' },
  uct: { name: 'UCT', fullName: 'Universidad Católica de Temuco', color: '#dc2626', websiteUrl: 'https://www.uct.cl' },
  uautonoma: { name: 'UAutónoma', fullName: 'Universidad Autónoma de Chile', color: '#7c3aed', websiteUrl: 'https://www.uautonoma.cl' },
  umayor: { name: 'UMayor', fullName: 'Universidad Mayor', color: '#ea580c', websiteUrl: 'https://www.umayor.cl' },
  ust: { name: 'UST', fullName: 'Universidad Santo Tomás', color: '#0f766e', websiteUrl: 'https://www.ust.cl' },
};

const CITY = 'Temuco · Araucanía';
// shortcut: parser HTTP laxo porque demre.cl envía un encabezado inválido que rechaza fetch; solo para esta descarga pública
function download(url: string, redirects = 3): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { insecureHTTPParser: true }, (res) => {
        const { statusCode = 0, headers } = res;
        if (statusCode >= 300 && statusCode < 400 && headers.location && redirects > 0) {
          res.resume();
          resolve(download(new URL(headers.location, url).toString(), redirects - 1));
          return;
        }
        if (statusCode !== 200) {
          res.resume();
          reject(new Error(`No se pudo descargar la oferta de DEMRE (HTTP ${statusCode})`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(new Uint8Array(Buffer.concat(chunks))));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

@Injectable()
export class DemreOfferScraper {
  private readonly logger = new Logger(DemreOfferScraper.name);

  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  async run() {
    const startedAt = new Date();
    try {
      const rows = await this.fetchRows();
      const itemsUpdated = await this.persist(rows);
      await this.db.insert(scrapeRuns).values({ target: 'careers', status: 'success', startedAt, finishedAt: new Date(), itemsUpdated });
      this.logger.log(`Oferta DEMRE sincronizada: ${itemsUpdated} carreras`);
      return itemsUpdated;
    } catch (error) {
      await this.db.insert(scrapeRuns).values({
        target: 'careers',
        status: 'failure',
        startedAt,
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async fetchRows() {
    const rows = parseDemreOffer(await readPdfPages(await download(DEMRE_OFFER_PDF_URL)));
    if (rows.length === 0) {
      throw new Error('El PDF de DEMRE no produjo ninguna carrera: probablemente cambió su formato');
    }
    return rows;
  }

  private async persist(rows: DemreOfferRow[]) {
    const now = new Date();
    return this.db.transaction(async (tx) => {
      await tx
        .insert(universities)
        .values(Object.values(UNIVERSITIES).map((u) => ({ ...u, city: CITY })))
        .onConflictDoNothing({ target: universities.name });

      const universityRows = await tx.select({ id: universities.id, name: universities.name }).from(universities);
      const idByName = new Map(universityRows.map((u) => [u.name, u.id]));

      const values = rows.flatMap((row) => {
        const universityId = idByName.get(UNIVERSITIES[row.university].name);
        if (!universityId || row.vacantes === null) {
          this.logger.warn(`Se omite ${row.university} ${row.code} ${row.name}: sin universidad o sin vacantes`);
          return [];
        }
        const name = titleCase(row.name);
        const areaCode = areaFor(name);
        if (!areaCode) this.logger.warn(`Sin área para "${name}" (${row.university} ${row.code})`);
        return [
          {
            universityId,
            externalCode: row.code,
            name,
            areaCode,
            vacantes: row.vacantes,
            weights: { ...row.weights, ...(row.historiaOCiencias && { historiaOCiencias: true }) },
            sourceUrl: DEMRE_OFFER_PDF_URL,
            lastScrapedAt: now,
          },
        ];
      });

      await tx
        .insert(careers)
        .values(values)
        .onConflictDoUpdate({
          target: [careers.universityId, careers.externalCode],
          set: {
            name: sql`excluded.name`,
            areaCode: sql`coalesce(excluded.area_code, ${careers.areaCode})`,
            vacantes: sql`excluded.vacantes`,
            weights: sql`excluded.weights`,
            sourceUrl: sql`excluded.source_url`,
            lastScrapedAt: sql`excluded.last_scraped_at`,
            updatedAt: now,
          },
        });

      return values.length;
    });
  }
}
