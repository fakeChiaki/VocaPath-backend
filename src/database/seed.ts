import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import { areas, universities, careers, type CareerWeights } from './schema/index.js';

const areasSeed = [
  { code: 'salud', label: 'Salud' },
  { code: 'ingenieria', label: 'Ingeniería' },
  { code: 'social', label: 'Ciencias Sociales' },
  { code: 'derecho', label: 'Derecho' },
  { code: 'educacion', label: 'Educación' },
  { code: 'negocios', label: 'Negocios' },
  { code: 'arte', label: 'Arte y Diseño' },
];

const universitiesSeed = [
  { name: 'UFRO', fullName: 'Universidad de La Frontera', city: 'Temuco · Araucanía', color: '#2563eb', websiteUrl: 'https://www.ufrontera.cl' },
  { name: 'UdeC', fullName: 'Universidad de Concepción', city: 'Concepción · Biobío', color: '#0ea5e9', websiteUrl: 'https://www.udec.cl' },
  { name: 'USACH', fullName: 'Universidad de Santiago de Chile', city: 'Santiago · Metropolitana', color: '#6366f1', websiteUrl: 'https://www.usach.cl' },
];

interface CareerSeed {
  university: string;
  areaCode: string;
  externalCode: string;
  name: string;
  title: string;
  degree: string;
  duration: string;
  regimen: string;
  vacantes: number;
  firstSelectedScore: number;
  cutoffScore: number;
  profile: string;
  weights: CareerWeights;
}

const careersSeed: CareerSeed[] = [
  {
    university: 'UFRO',
    areaCode: 'salud',
    externalCode: '24045',
    name: 'Medicina',
    title: 'Médico Cirujano',
    degree: 'Licenciado en Medicina',
    duration: '14 semestres',
    regimen: 'Diurno',
    vacantes: 120,
    firstSelectedScore: 1035.5,
    cutoffScore: 882.3,
    profile:
      'Personas con vocación de servicio, pensamiento científico y resistencia al estudio exigente. Te apasiona la biología, la salud de las personas y resolver problemas complejos bajo presión.',
    weights: { nem: 10, ranking: 20, lectora: 10, matematica: 20, historia: 0, ciencias: 40 },
  },
  {
    university: 'UFRO',
    areaCode: 'ingenieria',
    externalCode: '24021',
    name: 'Ingeniería Civil Informática',
    title: 'Ingeniero Civil Informático',
    degree: 'Licenciado en Ciencias de la Ingeniería',
    duration: '12 semestres',
    regimen: 'Diurno',
    vacantes: 80,
    firstSelectedScore: 945.2,
    cutoffScore: 705.4,
    profile:
      'Disfrutas la lógica, la programación y construir soluciones tecnológicas. Te motivan las matemáticas, el pensamiento abstracto y la innovación digital.',
    weights: { nem: 10, ranking: 20, lectora: 10, matematica: 40, historia: 0, ciencias: 20 },
  },
  {
    university: 'UFRO',
    areaCode: 'social',
    externalCode: '24038',
    name: 'Psicología',
    title: 'Psicólogo',
    degree: 'Licenciado en Psicología',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 90,
    firstSelectedScore: 912.7,
    cutoffScore: 740.1,
    profile:
      'Te interesa entender el comportamiento humano, escuchar y acompañar a las personas. Tienes empatía, sentido crítico y curiosidad por la mente.',
    weights: { nem: 15, ranking: 20, lectora: 25, matematica: 20, historia: 20, ciencias: 0 },
  },
  {
    university: 'UFRO',
    areaCode: 'derecho',
    externalCode: '24012',
    name: 'Derecho',
    title: 'Abogado',
    degree: 'Licenciado en Ciencias Jurídicas',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 110,
    firstSelectedScore: 905.0,
    cutoffScore: 698.6,
    profile:
      'Te gusta argumentar, leer, debatir y defender causas. Valoras la justicia, el orden social y la comunicación clara y persuasiva.',
    weights: { nem: 20, ranking: 20, lectora: 30, matematica: 10, historia: 20, ciencias: 0 },
  },
  {
    university: 'UFRO',
    areaCode: 'salud',
    externalCode: '24018',
    name: 'Enfermería',
    title: 'Enfermero',
    degree: 'Licenciado en Enfermería',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 100,
    firstSelectedScore: 921.4,
    cutoffScore: 760.8,
    profile:
      'Tienes vocación de cuidado, trabajo en equipo y resistencia. Te interesa la salud, el contacto humano y el trabajo clínico.',
    weights: { nem: 15, ranking: 20, lectora: 15, matematica: 20, historia: 0, ciencias: 30 },
  },
  {
    university: 'UFRO',
    areaCode: 'educacion',
    externalCode: '24052',
    name: 'Pedagogía en Educación Básica',
    title: 'Profesor de Educación Básica',
    degree: 'Licenciado en Educación',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 60,
    firstSelectedScore: 812.3,
    cutoffScore: 612.5,
    profile:
      'Te gusta enseñar, acompañar el aprendizaje de niños y generar impacto social. Tienes paciencia, creatividad y vocación formadora.',
    weights: { nem: 20, ranking: 30, lectora: 25, matematica: 25, historia: 0, ciencias: 0 },
  },
  {
    university: 'UdeC',
    areaCode: 'negocios',
    externalCode: '18030',
    name: 'Ingeniería Comercial',
    title: 'Ingeniero Comercial',
    degree: 'Licenciado en Ciencias de la Administración',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 150,
    firstSelectedScore: 968.4,
    cutoffScore: 752.0,
    profile:
      'Te motivan los negocios, la economía y liderar proyectos. Combinas habilidad numérica con visión estratégica y trabajo en equipo.',
    weights: { nem: 10, ranking: 20, lectora: 20, matematica: 40, historia: 10, ciencias: 0 },
  },
  {
    university: 'UdeC',
    areaCode: 'salud',
    externalCode: '18044',
    name: 'Kinesiología',
    title: 'Kinesiólogo',
    degree: 'Licenciado en Kinesiología',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 85,
    firstSelectedScore: 934.6,
    cutoffScore: 778.9,
    profile:
      'Te interesa el movimiento humano, la rehabilitación y el deporte. Tienes interés científico y vocación por ayudar a recuperar la salud.',
    weights: { nem: 15, ranking: 20, lectora: 15, matematica: 20, historia: 0, ciencias: 30 },
  },
  {
    university: 'USACH',
    areaCode: 'arte',
    externalCode: '11020',
    name: 'Arquitectura',
    title: 'Arquitecto',
    degree: 'Licenciado en Arquitectura',
    duration: '12 semestres',
    regimen: 'Diurno',
    vacantes: 95,
    firstSelectedScore: 952.1,
    cutoffScore: 743.2,
    profile:
      'Combinas creatividad, dibujo y pensamiento espacial con cálculo. Te interesa el diseño, la ciudad y materializar ideas en espacios.',
    weights: { nem: 15, ranking: 20, lectora: 25, matematica: 40, historia: 0, ciencias: 0 },
  },
  {
    university: 'USACH',
    areaCode: 'social',
    externalCode: '11035',
    name: 'Periodismo',
    title: 'Periodista',
    degree: 'Licenciado en Comunicación Social',
    duration: '10 semestres',
    regimen: 'Diurno',
    vacantes: 70,
    firstSelectedScore: 889.5,
    cutoffScore: 651.7,
    profile:
      'Te gusta escribir, investigar y contar historias. Tienes curiosidad por la actualidad, pensamiento crítico y buena comunicación.',
    weights: { nem: 20, ranking: 20, lectora: 35, matematica: 10, historia: 15, ciencias: 0 },
  },
];

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida');
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  await db.insert(areas).values(areasSeed).onConflictDoNothing();
  await db.insert(universities).values(universitiesSeed).onConflictDoNothing({ target: universities.name });

  const universityRows = await db.select().from(universities);
  const universityIdByName = new Map(universityRows.map((u) => [u.name, u.id]));

  for (const career of careersSeed) {
    const universityId = universityIdByName.get(career.university);
    if (!universityId) {
      throw new Error(`No se encontró la universidad "${career.university}" para sembrar carreras`);
    }

    const [existing] = await db
      .select()
      .from(careers)
      .where(eq(careers.externalCode, career.externalCode))
      .limit(1);
    if (existing) {
      continue;
    }

    const university = universityRows.find((u) => u.id === universityId)!;
    await db.insert(careers).values({
      universityId,
      areaCode: career.areaCode,
      externalCode: career.externalCode,
      name: career.name,
      title: career.title,
      degree: career.degree,
      duration: career.duration,
      regimen: career.regimen,
      vacantes: career.vacantes,
      firstSelectedScore: career.firstSelectedScore,
      cutoffScore: career.cutoffScore,
      profile: career.profile,
      weights: career.weights,
      sourceUrl: university.websiteUrl,
    });
  }

  console.log('Seed completado');
  await client.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
