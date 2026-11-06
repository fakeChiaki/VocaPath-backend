import * as cheerio from 'cheerio';
import { z } from 'zod';
import { summarize } from '../text.js';

const EXCLUDED_SLUG = /vespertin|online|prosecucion|semipresencial/;

export const UautonomaCareerSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  title: z.string().nullable(),
  degree: z.string().nullable(),
  duration: z.string().nullable(),
  regimen: z.string().nullable(),
  firstSelectedScore: z.number().nullable(),
  cutoffScore: z.number().nullable(),
  curriculumUrl: z.string().url().nullable(),
  profile: z.string().nullable(),
});

export type UautonomaCareer = z.infer<typeof UautonomaCareerSchema>;

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeText(text: string) {
  return clean(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function normalizeCareerName(text: string) {
  return normalizeText(text.replace(/\(.*?\)/g, '').replace(/\*/g, ''));
}

function score(value: string | undefined) {
  const n = Number(value?.replace(',', '.'));
  return Number.isFinite(n) && value ? n : null;
}

export function parseUautonomaListing(html: string) {
  const $ = cheerio.load(html);
  const urls = new Set<string>();
  $('a[href]').each((_, a) => {
    const match = new URL($(a).attr('href') ?? '', 'https://admision.uautonoma.cl/carreras/').href.match(/^https:\/\/admision\.uautonoma\.cl\/carreras\/([a-z0-9-]+)\/?$/);
    const slug = match?.[1];
    if (slug && !slug.startsWith('carreras-') && !['diurnas', 'online', 'vespertinas'].includes(slug) && !EXCLUDED_SLUG.test(slug)) {
      urls.add(`https://admision.uautonoma.cl/carreras/${slug}/`);
    }
  });
  return [...urls];
}

export function parseUautonomaCareerPage(html: string, url: string): UautonomaCareer | null {
  const $ = cheerio.load(html);

  const temucoTargets = $('button.nav-link')
    .filter((_, b) => normalizeText($(b).text()) === 'temuco')
    .map((_, b) => $(b).attr('data-bs-target'))
    .get();
  if (temucoTargets.length === 0) return null;

  let scores: { first: number | null; last: number | null } | null = null;
  for (const target of temucoTargets) {
    const pane = $(target);
    const labelled = (label: string) =>
      score(
        pane
          .find('li')
          .filter((_, li) => normalizeText($(li).find('strong').text()).startsWith(label))
          .first()
          .clone()
          .children()
          .remove()
          .end()
          .text()
          .trim(),
      );
    const last = labelled('ultimo seleccionado');
    if (last !== null || labelled('primer seleccionado') !== null) {
      scores = { first: labelled('primer seleccionado'), last };
      break;
    }
  }

  const info = new Map<string, string>();
  $('h4.title').each((_, h) => {
    const value = clean($(h).next('.text').find('p').first().text());
    if (value) info.set(normalizeText($(h).text()), value);
  });

  const name = clean($('h1').first().text()).replace(/^Carrera de /, '');
  const regimen = clean($('*').filter((_, e) => $(e).children().length === 0 && /^Modalidad\s/i.test($(e).text().trim())).first().text()).replace(/^Modalidad\s+/i, '');
  const malla = $('a[href$=".pdf"]')
    .filter((_, a) => /malla/i.test($(a).attr('href') ?? ''))
    .first()
    .attr('href');

  if (!name) return null;

  const blocks = $('h2, p').toArray();
  const start = blocks.findIndex((e) => e.tagName === 'h2' && /¿(En qué consiste|Qué es)/i.test($(e).text()));
  let profile: string | null = null;
  for (let i = start + 1; start >= 0 && i < blocks.length && blocks[i]!.tagName !== 'h2' && !profile; i++) {
    const text = clean($(blocks[i]).text());
    if (text.length > 80) profile = summarize(text);
  }

  return UautonomaCareerSchema.parse({
    url,
    name,
    title: info.get('titulo profesional') ?? null,
    degree: info.get('grado academico') ?? null,
    duration: info.get('duracion')?.toLowerCase() ?? null,
    regimen: regimen || null,
    firstSelectedScore: scores?.first ?? null,
    cutoffScore: scores?.last ?? null,
    curriculumUrl: malla ? new URL(malla, url).toString() : null,
    profile,
  });
}
