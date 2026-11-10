import * as cheerio from 'cheerio';
import { z } from 'zod';
import { httpUrl } from '../schemas.js';
import { summarize } from '../text.js';

export const UstCareerSchema = z.object({
  url: z.string().url(),
  title: z.string().nullable(),
  degree: z.string().nullable(),
  duration: z.string().nullable(),
  regimen: z.string().nullable(),
  curriculumUrl: httpUrl.nullable(),
  profile: z.string().nullable(),
});

export type UstCareer = z.infer<typeof UstCareerSchema>;

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeLabel(text: string) {
  return clean(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function ustCareerUrl(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://www.ust.cl/carreras/${slug}/`;
}

export function parseUstCareerPage(html: string, url: string): UstCareer | null {
  const $ = cheerio.load(html);
  if ($('a.sede-link[title="Ver sede Temuco"]').length === 0) return null;

  const info = new Map<string, string>();
  $('h2.carrera__info__title').each((_, h) => {
    const text = $(h).next('p.carrera__info__text').clone();
    text.find('small').remove();
    const value = clean(text.text());
    if (value) info.set(normalizeLabel($(h).text()), value);
  });
  if (!info.has('duracion')) return null;

  const malla = $('a[href$=".pdf"]')
    .filter((_, a) => /malla/i.test($(a).text()))
    .first()
    .attr('href');

  return UstCareerSchema.parse({
    url,
    title: info.get('titulo') ?? null,
    degree: info.get('grado academico') ?? null,
    duration: info.get('duracion')?.toLowerCase() ?? null,
    regimen: info.get('jornada') ?? null,
    curriculumUrl: malla ? new URL(malla, url).toString() : null,
    profile: summarize($('.carrera__descripcion__body p').filter((_, p) => $(p).text().trim().length > 0).first().text()),
  });
}
