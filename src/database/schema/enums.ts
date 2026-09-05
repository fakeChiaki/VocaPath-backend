import { pgEnum } from 'drizzle-orm/pg-core';

export const paesSubjectEnum = pgEnum('paes_subject', [
  'lectora',
  'matematica',
  'historia',
  'ciencias',
]);
export type PaesSubject = (typeof paesSubjectEnum.enumValues)[number];

export const mencionCienciasEnum = pgEnum('mencion_ciencias', [
  'ninguna',
  'biologia',
  'fisica',
  'quimica',
]);
export type MencionCiencias = (typeof mencionCienciasEnum.enumValues)[number];

export const scoreFactorEnum = pgEnum('score_factor', [
  'lectora',
  'matematica',
  'historia',
  'ciencias',
  'nem',
  'ranking',
]);
export type ScoreFactor = (typeof scoreFactorEnum.enumValues)[number];

export const scoreSourceEnum = pgEnum('score_source', ['manual', 'paes_attempt']);

export const scrapeTargetEnum = pgEnum('scrape_target', [
  'universities',
  'careers',
  'paes_dates',
]);

export const scrapeStatusEnum = pgEnum('scrape_status', ['success', 'failure', 'partial']);

export const paesDateStatusEnum = pgEnum('paes_date_status', [
  'Próximo',
  'Programado',
  'Finalizado',
]);
