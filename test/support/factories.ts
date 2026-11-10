import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../src/database/schema/index.js';
import { TEST_DATABASE_URL } from './env.js';

export function openTestDb() {
  const client = postgres(TEST_DATABASE_URL, { max: 2, onnotice: () => {} });
  return { db: drizzle(client, { schema }), close: () => client.end() };
}

export type TestDb = ReturnType<typeof openTestDb>['db'];

const NO_WEIGHTS: schema.CareerWeights = {
  nem: 0,
  ranking: 0,
  lectora: 0,
  matematica: 0,
  matematica2: 0,
  historia: 0,
  ciencias: 0,
};

export const weights = (partial: Partial<schema.CareerWeights>): schema.CareerWeights => ({ ...NO_WEIGHTS, ...partial });

interface CareerSeed {
  university: string;
  name: string;
  cutoffScore: number | null;
  weights: schema.CareerWeights;
}

const UNIVERSITIES = [
  { name: 'UFRO', fullName: 'Universidad de La Frontera', city: 'Temuco', color: '#2563eb', websiteUrl: 'https://www.ufro.cl' },
  { name: 'UCT', fullName: 'Universidad Católica de Temuco', city: 'Temuco', color: '#dc2626', websiteUrl: 'https://www.uct.cl' },
  { name: 'UMayor', fullName: 'Universidad Mayor', city: 'Temuco', color: '#ea580c', websiteUrl: 'https://www.umayor.cl' },
];

const CAREERS: CareerSeed[] = [
  {
    university: 'UFRO',
    name: 'Medicina',
    cutoffScore: 882.3,
    weights: weights({ nem: 10, ranking: 30, lectora: 15, matematica: 25, ciencias: 20 }),
  },
  {
    university: 'UFRO',
    name: 'Ingeniería Civil Informática',
    cutoffScore: 705.4,
    weights: weights({ nem: 20, ranking: 20, lectora: 25, matematica: 35 }),
  },
  {
    university: 'UCT',
    name: 'Ingeniería Comercial',
    cutoffScore: 650,
    weights: weights({ nem: 20, ranking: 40, lectora: 10, matematica: 20, historia: 10, ciencias: 10, historiaOCiencias: true }),
  },
  {
    university: 'UMayor',
    name: 'Agronomía',
    cutoffScore: null,
    weights: weights({ nem: 20, ranking: 30, lectora: 20, matematica: 30 }),
  },
];

const QUESTION_OPTIONS = ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'];

const questions = (subject: 'lectora' | 'ciencias', mencion: 'ninguna' | 'biologia') =>
  [1, 2, 3, 4].map((n) => ({
    subject,
    mencion,
    text: `Pregunta ${n} de ${subject} (${mencion})`,
    options: QUESTION_OPTIONS,
    correctIndex: 0,
  }));

/** Catálogo mínimo y determinista para las pruebas: 3 universidades, 4 carreras y bancos de preguntas. */
export async function seedCatalog(db: TestDb) {
  const universities = await db.insert(schema.universities).values(UNIVERSITIES).returning();
  const universityId = new Map(universities.map((u) => [u.name, u.id]));

  const careers = await db
    .insert(schema.careers)
    .values(
      CAREERS.map((c, index) => ({
        universityId: universityId.get(c.university)!,
        externalCode: String(10000 + index),
        name: c.name,
        vacantes: 50,
        cutoffScore: c.cutoffScore,
        weights: c.weights,
        sourceUrl: 'https://example.test/fuente',
      })),
    )
    .returning();

  await db.insert(schema.paesQuestions).values([...questions('lectora', 'ninguna'), ...questions('ciencias', 'biologia')]);

  return { careers: Object.fromEntries(careers.map((c) => [c.name, c])) };
}
