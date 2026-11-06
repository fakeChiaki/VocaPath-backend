import * as cheerio from 'cheerio';
import { z } from 'zod';

export const UmayorCareerSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  title: z.string().nullable(),
  degree: z.string().nullable(),
  duration: z.string().nullable(),
  regimen: z.string().nullable(),
  curriculumUrl: z.string().url().nullable(),
});

export type UmayorCareer = z.infer<typeof UmayorCareerSchema>;

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

export function normalizeName(text: string) {
  return clean(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function parseUmayorListing(html: string) {
  const $ = cheerio.load(html);
  const urls = new Set<string>();
  $('a[href]').each((_, a) => {
    const href = $(a).attr('href') ?? '';
    if (/^https:\/\/www\.umayor\.cl\/um\/carreras\/[a-z0-9-]+-temuco\/?$/.test(href)) urls.add(href);
  });
  return [...urls];
}

export function parseUmayorCareerPage(html: string, url: string): UmayorCareer | null {
  const $ = cheerio.load(html);
  const name = clean($('h1').first().text());
  const fields = new Map<string, string>();
  $('.box-resumen').each((_, box) => {
    const label = normalizeName($(box).find('h4').first().text());
    const value = clean($(box).find('p').first().text());
    if (label && value) fields.set(label, value);
  });
  if (!name || !fields.has('duracion')) return null;

  const malla = $('a[href$=".pdf"]')
    .filter((_, a) => ($(a).attr('href') ?? '').includes('/mallas/'))
    .first()
    .attr('href');

  return UmayorCareerSchema.parse({
    url,
    name,
    title: fields.get('titulo profesional') ?? null,
    degree: fields.get('grado academico') ?? null,
    duration: fields.get('duracion')?.toLowerCase() ?? null,
    regimen: fields.get('regimen') ?? null,
    curriculumUrl: malla ? new URL(malla, url).toString() : null,
  });
}
