import { z } from 'zod';
import type { PdfItem, PdfPage } from './pdf-pages.js';

export const TARGET_UNIVERSITIES = [
  { key: 'ufro', header: 'UNIVERSIDAD DE LA FRONTERA' },
  { key: 'uct', header: 'UNIVERSIDAD CATOLICA DE TEMUCO' },
  { key: 'uautonoma', header: 'UNIVERSIDAD AUTONOMA DE CHILE' },
  { key: 'umayor', header: 'UNIVERSIDAD MAYOR' },
  { key: 'ust', header: 'UNIVERSIDAD SANTO TOMAS' },
] as const;

export type UniversityKey = (typeof TARGET_UNIVERSITIES)[number]['key'];

const weight = z.number().int().min(0).max(100);

export const DemreOfferRowSchema = z.object({
  university: z.enum(TARGET_UNIVERSITIES.map((u) => u.key) as [UniversityKey, ...UniversityKey[]]),
  code: z.string().regex(/^\d{5}$/),
  name: z.string().min(1),
  place: z.string().min(1),
  weights: z.object({
    nem: weight,
    ranking: weight,
    lectora: weight,
    matematica: weight,
    matematica2: weight,
    historia: weight,
    ciencias: weight,
  }),
  historiaOCiencias: z.boolean(),
  vacantes: z.number().int().min(0).nullable(),
});

export type DemreOfferRow = z.infer<typeof DemreOfferRowSchema>;

const HEADER_BAND = 100;
const MAX_COLUMN_DISTANCE = 18;
const ROW_TOLERANCE = 14;

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function pageTitle(page: PdfPage) {
  return normalize(
    page.items
      .filter((i) => i.y < HEADER_BAND && !/^\d+$/.test(i.str))
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((i) => i.str)
      .join(' '),
  );
}

interface Columns {
  place: number;
  nem: number;
  ranking: number;
  lectora: number;
  matematica: number;
  historia?: number;
  ciencias?: number;
  matematica2?: number;
  vacantes: number;
}

function findColumns(page: PdfPage, firstRowY: number): Columns {
  const header = page.items.filter((i) => i.y >= HEADER_BAND && i.y < firstRowY);
  const x = (match: (str: string) => boolean) => header.find((i) => match(i.str))?.x;
  const competencias = header
    .filter((i) => i.str.startsWith('COMPETENCIA'))
    .map((i) => i.x)
    .sort((a, b) => a - b);
  const m2 = competencias[2];
  const ciencias = header
    .filter((i) => i.str === 'CIENCIAS' && (m2 === undefined || i.x < m2))
    .reduce<number | undefined>((max, i) => (max === undefined || i.x > max ? i.x : max), undefined);

  const columns = {
    place: x((s) => s.startsWith('LUGAR')),
    nem: x((s) => s === 'NEM'),
    ranking: x((s) => s === 'RANKING'),
    lectora: competencias[0],
    matematica: competencias[1],
    historia: x((s) => s.startsWith('HISTORIA')),
    ciencias,
    matematica2: m2,
    vacantes: x((s) => s === 'REGULAR'),
  };
  const required = ['place', 'nem', 'ranking', 'lectora', 'matematica', 'vacantes'] as const;
  const missing = required.filter((k) => columns[k] === undefined);
  if (missing.length) {
    throw new Error(`Encabezados no encontrados en la tabla de DEMRE: ${missing.join(', ')}`);
  }
  return columns as Columns;
}

function nearestItem(items: PdfItem[], colX: number) {
  const best = items.reduce<PdfItem | null>(
    (acc, i) => (acc === null || Math.abs(i.x - colX) < Math.abs(acc.x - colX) ? i : acc),
    null,
  );
  return best && Math.abs(best.x - colX) <= MAX_COLUMN_DISTANCE ? best.str : undefined;
}

function parsePage(page: PdfPage, university: UniversityKey): DemreOfferRow[] {
  const codeCandidates = page.items.filter((i) => /^\d{5}$/.test(i.str) && i.x < 100 && i.y > HEADER_BAND);
  if (codeCandidates.length === 0) return [];
  const columns = findColumns(page, Math.min(...codeCandidates.map((c) => c.y)));
  const valueColumns = (Object.entries(columns) as [string, number | undefined][]).filter(
    (e): e is [string, number] => e[1] !== undefined && e[0] !== 'place',
  );
  const codes = codeCandidates;

  const rows = new Map<PdfItem, PdfItem[]>(codes.map((c) => [c, []]));
  for (const item of page.items) {
    if (codes.includes(item) || item.y < HEADER_BAND) continue;
    const owner = codes.reduce<PdfItem | null>(
      (best, c) => (best === null || Math.abs(c.y - item.y) < Math.abs(best.y - item.y) ? c : best),
      null,
    );
    if (owner && Math.abs(owner.y - item.y) <= ROW_TOLERANCE) rows.get(owner)!.push(item);
  }

  return [...rows].map(([code, items]) => {
    const sorted = items.sort((a, b) => a.y - b.y || a.x - b.x);
    const name = sorted
      .filter((i) => i.x > code.x + 10 && i.x < columns.place - 8)
      .map((i) => i.str)
      .join(' ')
      .replace(/\s*\(\d+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const place = sorted
      .filter((i) => i.x >= columns.place - 12 && i.x < columns.nem - 8)
      .map((i) => i.str)
      .join(' ');

    const candidates = sorted.filter((i) => i.x >= columns.nem - 10 && /^(\d+|-+)$/.test(i.str));
    const values: Record<string, string | undefined> = {};
    for (const [column, colX] of valueColumns) values[column] = nearestItem(candidates, colX);
    const num = (key: string) => (values[key] && /^\d+$/.test(values[key]) ? Number(values[key]) : 0);

    const histX = columns.historia ?? Infinity;
    const cienX = columns.ciencias ?? -Infinity;
    return {
      university,
      code: code.str,
      name,
      place,
      weights: {
        nem: num('nem'),
        ranking: num('ranking'),
        lectora: num('lectora'),
        matematica: num('matematica'),
        matematica2: num('matematica2'),
        historia: num('historia'),
        ciencias: num('ciencias'),
      },
      historiaOCiencias: sorted.some((i) => i.str === 'o' && i.x > histX && i.x < cienX),
      vacantes: values.vacantes && /^\d+$/.test(values.vacantes) ? Number(values.vacantes) : null,
    };
  });
}

export function parseDemreOffer(pages: PdfPage[], place = 'TEMUCO'): DemreOfferRow[] {
  let current: UniversityKey | null = null;
  const rows = pages.flatMap((page) => {
    const title = pageTitle(page);
    if (title) current = TARGET_UNIVERSITIES.find((u) => u.header === title)?.key ?? null;
    return current ? parsePage(page, current) : [];
  });
  return rows
    .filter((r) => normalize(r.place).startsWith(place))
    .map((r) => DemreOfferRowSchema.parse(r));
}
