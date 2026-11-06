import * as cheerio from 'cheerio';
import { z } from 'zod';
import { titleCase } from '../text.js';

export const UfroCareerSchema = z.object({
  url: z.string().url(),
  codes: z.array(z.string().regex(/^\d{5}$/)).min(1),
  title: z.string().nullable(),
  degree: z.string().nullable(),
  duration: z.string().nullable(),
  regimen: z.string().nullable(),
  firstSelectedScore: z.number().nullable(),
  cutoffScore: z.number().nullable(),
  curriculumUrl: z.string().url().nullable(),
});

export type UfroCareer = z.infer<typeof UfroCareerSchema>;

function clean(text: string) {
  return text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeLabel(text: string) {
  return clean(text).normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
}

function readTable($: cheerio.CheerioAPI, labelFragment: string) {
  const header = $('tr')
    .filter((_, tr) => $(tr).children('td,th').toArray().some((c) => normalizeLabel($(c).text()).includes(labelFragment)))
    .first();
  const values = header.next('tr').children('td,th').toArray();
  const out = new Map<string, string>();
  header
    .children('td,th')
    .toArray()
    .forEach((cell, i) => {
      const label = normalizeLabel($(cell).text());
      if (label && values[i]) out.set(label, clean($(values[i]).text()));
    });
  return out;
}

function lookup(table: Map<string, string>, fragment: string) {
  for (const [label, value] of table) if (label.includes(fragment) && value && value !== '–') return value;
  return null;
}

function score(value: string | null) {
  if (!value) return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function joinParts(value: string | null, separator = ' / ', splitOn: RegExp | string = '|') {
  if (!value) return null;
  return (
    value
      .split(splitOn)
      .map((p) => titleCase(clean(p)))
      .filter(Boolean)
      .join(separator) || null
  );
}

export function parseUfroCareerPage(html: string, url: string): UfroCareer | null {
  const $ = cheerio.load(html);
  $('br').replaceWith(' | ');
  $('li,p').after(' | ');

  const info = readTable($, 'CODIGO');
  const codes = lookup(info, 'CODIGO')?.match(/\d{5}/g);
  if (!codes) return null;

  const admission = readTable($, 'PUNTAJE PRIMERA');
  const curriculumUrl = $('a[href$=".pdf"]')
    .filter((_, a) => /malla/i.test($(a).text()))
    .first()
    .attr('href');

  return UfroCareerSchema.parse({
    url,
    codes: [...new Set(codes)],
    title: joinParts(lookup(info, 'TITULO')),
    degree: joinParts(lookup(info, 'GRADO')),
    duration: lookup(info, 'DURACION')?.toLowerCase() ?? null,
    regimen: joinParts(lookup(info, 'REGIMEN'), ', ', /[|,]/),
    firstSelectedScore: score(lookup(admission, 'PRIMERA')),
    cutoffScore: score(lookup(admission, 'ULTIMA')),
    curriculumUrl: curriculumUrl ?? null,
  });
}
