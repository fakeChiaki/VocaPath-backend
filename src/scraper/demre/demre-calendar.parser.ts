import * as cheerio from 'cheerio';
import { z } from 'zod';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

interface CalendarEvent {
  date: string;
  text: string;
}

interface DateRule {
  phase: string;
  title: string;
  icon: string;
  start: RegExp;
  end?: RegExp;
}

const RULES: DateRule[] = [
  { phase: 'Inscripción', title: 'Inicio inscripción PAES', icon: '📝', start: /^se inicia etapa de inscripcion paes regular/ },
  { phase: 'Inscripción', title: 'Cierre de inscripción', icon: '⏳', start: /^finaliza etapa de inscripcion paes regular/ },
  { phase: 'Rendición', title: 'Comp. Lectora', icon: '📖', start: /^rendicion paes competencia lectora/ },
  { phase: 'Rendición', title: 'Comp. Matemática 1', icon: '🧮', start: /^rendicion paes competencia matematica 1/ },
  { phase: 'Rendición', title: 'Comp. Matemática 2 (electiva)', icon: '📐', start: /^rendicion paes competencia matematica 2/ },
  { phase: 'Rendición', title: 'Ciencias (electiva)', icon: '🔬', start: /^rendicion paes electiva de ciencias/ },
  { phase: 'Rendición', title: 'Historia y Cs. Sociales (electiva)', icon: '🌎', start: /^rendicion paes electiva de historia/ },
  { phase: 'Resultados', title: 'Publicación de puntajes', icon: '🎯', start: /^resultados de puntajes paes regular/ },
  { phase: 'Postulación', title: 'Postulación a universidades', icon: '🏛️', start: /^inicio etapa de postulaciones/, end: /^finaliza etapa de postulaciones/ },
  { phase: 'Resultados', title: 'Resultados de selección', icon: '✅', start: /^resultados del proceso de seleccion/ },
  { phase: 'Matrícula', title: 'Proceso de matrícula', icon: '🎓', start: /^proceso de matricula: inicio de primera etapa/, end: /^proceso de matricula: cierre de segunda etapa/ },
];

export const PaesDateSchema = z.object({
  phase: z.string(),
  title: z.string(),
  icon: z.string(),
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateLabel: z.string(),
  status: z.enum(['Próximo', 'Programado', 'Finalizado']),
});

export type PaesDate = z.infer<typeof PaesDateSchema>;

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function parseCalendarEvents(html: string): CalendarEvent[] {
  const $ = cheerio.load(html);
  const events: CalendarEvent[] = [];
  let year: number | null = null;
  $('section.calendario-pagina')
    .children()
    .each((_, node) => {
      if (node.tagName === 'h2') {
        year = Number($(node).text().match(/A[ñn]o (\d{4})/i)?.[1]) || year;
        return;
      }
      if (node.tagName !== 'ul' || year === null) return;
      $(node)
        .children('li')
        .each((_, li) => {
          const month = MONTHS.findIndex((m) => m.startsWith(normalize($(li).find('.port-mes').text()).slice(0, 3)));
          const day = Number($(li).find('.port-dia').text().trim());
          const text = $(li).find('p').text().replace(/\s+/g, ' ').trim();
          if (month < 0 || !day || !text) return;
          events.push({ date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`, text });
        });
    });
  return events;
}

function label(start: string, end: string) {
  const [y1, m1, d1] = start.split('-').map(Number) as [number, number, number];
  const [y2, m2, d2] = end.split('-').map(Number) as [number, number, number];
  if (start === end) return `${d1} de ${MONTHS[m1 - 1]} de ${y1}`;
  if (y1 === y2 && m1 === m2) return `${d1} al ${d2} de ${MONTHS[m1 - 1]} de ${y1}`;
  return `${d1} de ${MONTHS[m1 - 1]}${y1 === y2 ? '' : ` de ${y1}`} al ${d2} de ${MONTHS[m2 - 1]} de ${y2}`;
}

function status(start: string, end: string, today: string): PaesDate['status'] {
  if (end < today) return 'Finalizado';
  const soon = new Date(`${today}T00:00:00Z`);
  soon.setUTCDate(soon.getUTCDate() + 45);
  return start <= soon.toISOString().slice(0, 10) ? 'Próximo' : 'Programado';
}

export function buildPaesDates(events: CalendarEvent[], today: string) {
  const dates: PaesDate[] = [];
  const missing: string[] = [];
  for (const rule of RULES) {
    const start = events.find((e) => rule.start.test(normalize(e.text)));
    const end = rule.end ? events.find((e) => rule.end!.test(normalize(e.text))) : start;
    if (!start || !end) {
      missing.push(rule.title);
      continue;
    }
    dates.push(
      PaesDateSchema.parse({
        phase: rule.phase,
        title: rule.title,
        icon: rule.icon,
        dateStart: start.date,
        dateEnd: end.date,
        dateLabel: label(start.date, end.date),
        status: status(start.date, end.date, today),
      }),
    );
  }
  return { dates, missing };
}
