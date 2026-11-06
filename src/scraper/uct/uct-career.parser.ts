import * as cheerio from 'cheerio';
import { z } from 'zod';
import { summarize, titleCase } from '../text.js';

const NON_CAREER_SLUGS = new Set(['calendario', 'carreras', 'admision-especial', 'dudas', 'becas-y-creditos', 'contacto']);

export const UctCareerSchema = z.object({
  url: z.string().url(),
  code: z.string().regex(/^\d{5}$/),
  title: z.string().nullable(),
  degree: z.string().nullable(),
  duration: z.string().nullable(),
  regimen: z.string().nullable(),
  profile: z.string().nullable(),
});

export type UctCareer = z.infer<typeof UctCareerSchema>;

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeLabel(text: string) {
  return clean(text).normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
}

export function parseUctListing(html: string) {
  const $ = cheerio.load(html);
  const urls = new Set<string>();
  $('a[href]').each((_, a) => {
    const match = ($(a).attr('href') ?? '').match(/^https:\/\/admision\.uct\.cl\/([a-z0-9-]+)\/?$/);
    if (match && !NON_CAREER_SLUGS.has(match[1]!)) urls.add(`https://admision.uct.cl/${match[1]}/`);
  });
  return [...urls];
}

export function parseUctCareerPage(html: string, url: string): UctCareer[] {
  const $ = cheerio.load(html);
  const careers: UctCareer[] = [];
  const profile = summarize(
    $('.elementor-accordion-item')
      .filter((_, item) => /identidad/i.test($(item).find('.elementor-accordion-title').text()))
      .first()
      .find('.elementor-tab-content p')
      .first()
      .text(),
  );
  $('strong').each((_, strong) => {
    if (normalizeLabel($(strong).text()) !== 'CODIGO DEMRE') return;
    const fields = new Map<string, string>();
    $(strong)
      .parent()
      .find('strong')
      .each((_, label) => {
        const value = clean($(label).nextAll('span').first().text());
        if (value) fields.set(normalizeLabel($(label).text()), value);
      });
    const code = fields.get('CODIGO DEMRE')?.match(/\d{5}/)?.[0];
    if (!code) return;
    const text = (label: string) => (fields.has(label) ? titleCase(fields.get(label)!) : null);
    careers.push(
      UctCareerSchema.parse({
        url,
        code,
        title: text('TITULO PROFESIONAL'),
        degree: text('GRADO ACADEMICO'),
        duration: fields.get('DURACION')?.toLowerCase() ?? null,
        regimen: text('MODALIDAD'),
        profile,
      }),
    );
  });
  return careers;
}
