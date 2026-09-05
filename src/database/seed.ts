import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import {
  areas,
  universities,
  careers,
  paesDates,
  paesQuestions,
  vocationalQuestions,
  vocationalOptions,
  type CareerWeights,
  type PaesSubject,
  type MencionCiencias,
} from './schema/index.js';

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

interface PaesQuestionSeed {
  subject: PaesSubject;
  mencion: MencionCiencias;
  text: string;
  options: string[];
  correctIndex: number;
}

const paesQuestionsSeed: PaesQuestionSeed[] = [
  {
    subject: 'lectora',
    mencion: 'ninguna',
    text: '¿Cuál es la función del conector "no obstante"?',
    options: ['Añadir información', 'Expresar contraste', 'Indicar causa', 'Ordenar ideas'],
    correctIndex: 1,
  },
  {
    subject: 'lectora',
    mencion: 'ninguna',
    text: 'Un texto argumentativo busca principalmente:',
    options: ['Narrar hechos', 'Convencer al lector', 'Describir un lugar', 'Entretener'],
    correctIndex: 1,
  },
  {
    subject: 'lectora',
    mencion: 'ninguna',
    text: 'La idea principal de un párrafo suele estar en:',
    options: ['La oración temática', 'Una nota al pie', 'El título del libro', 'La bibliografía'],
    correctIndex: 0,
  },
  {
    subject: 'lectora',
    mencion: 'ninguna',
    text: '"Sinónimo" significa palabra de significado:',
    options: ['Opuesto', 'Similar', 'Técnico', 'Extranjero'],
    correctIndex: 1,
  },
  {
    subject: 'matematica',
    mencion: 'ninguna',
    text: '¿Cuánto es 15% de 240?',
    options: ['24', '36', '30', '45'],
    correctIndex: 1,
  },
  {
    subject: 'matematica',
    mencion: 'ninguna',
    text: 'Si x + 7 = 12, entonces x =',
    options: ['4', '5', '6', '19'],
    correctIndex: 1,
  },
  {
    subject: 'matematica',
    mencion: 'ninguna',
    text: 'El área de un triángulo de base 8 y altura 5 es:',
    options: ['20', '40', '13', '26'],
    correctIndex: 0,
  },
  {
    subject: 'matematica',
    mencion: 'ninguna',
    text: '¿Cuál es el promedio de 4, 8 y 12?',
    options: ['6', '8', '10', '12'],
    correctIndex: 1,
  },
  {
    subject: 'historia',
    mencion: 'ninguna',
    text: 'La Constitución vigente de Chile fue promulgada en:',
    options: ['1925', '1980', '1990', '2005'],
    correctIndex: 1,
  },
  {
    subject: 'historia',
    mencion: 'ninguna',
    text: '¿Qué poder del Estado crea las leyes?',
    options: ['Ejecutivo', 'Legislativo', 'Judicial', 'Municipal'],
    correctIndex: 1,
  },
  {
    subject: 'historia',
    mencion: 'ninguna',
    text: 'La Revolución Industrial se inició en:',
    options: ['Francia', 'Inglaterra', 'Alemania', 'EE.UU.'],
    correctIndex: 1,
  },
  {
    subject: 'historia',
    mencion: 'ninguna',
    text: 'El PIB mide principalmente:',
    options: ['La población', 'La producción de bienes y servicios', 'El clima', 'La educación'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'biologia',
    text: 'La unidad básica de la vida es:',
    options: ['El átomo', 'La célula', 'El tejido', 'La molécula'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'biologia',
    text: '¿Qué órgano bombea la sangre?',
    options: ['Pulmón', 'Corazón', 'Hígado', 'Riñón'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'biologia',
    text: 'La fotosíntesis ocurre principalmente en:',
    options: ['Las hojas', 'La raíz', 'El tallo', 'La flor'],
    correctIndex: 0,
  },
  {
    subject: 'ciencias',
    mencion: 'biologia',
    text: 'La molécula que contiene la información genética es:',
    options: ['La proteína', 'La glucosa', 'El ADN', 'El lípido'],
    correctIndex: 2,
  },
  {
    subject: 'ciencias',
    mencion: 'fisica',
    text: 'La fuerza que atrae los objetos a la Tierra es:',
    options: ['Magnetismo', 'Gravedad', 'Fricción', 'Tensión'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'fisica',
    text: 'La unidad de fuerza en el Sistema Internacional es:',
    options: ['El newton', 'El joule', 'El watt', 'El pascal'],
    correctIndex: 0,
  },
  {
    subject: 'ciencias',
    mencion: 'fisica',
    text: 'La rapidez media se calcula como:',
    options: ['distancia × tiempo', 'masa × aceleración', 'distancia / tiempo', 'tiempo / distancia'],
    correctIndex: 2,
  },
  {
    subject: 'ciencias',
    mencion: 'fisica',
    text: 'El sonido NO se propaga en:',
    options: ['El agua', 'El vacío', 'El aire', 'Los sólidos'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'quimica',
    text: 'El agua está compuesta por hidrógeno y:',
    options: ['Carbono', 'Oxígeno', 'Nitrógeno', 'Helio'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'quimica',
    text: 'El pH de una solución neutra es:',
    options: ['0', '7', '14', '1'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'quimica',
    text: 'El símbolo químico del sodio es:',
    options: ['S', 'Na', 'So', 'N'],
    correctIndex: 1,
  },
  {
    subject: 'ciencias',
    mencion: 'quimica',
    text: 'El cambio de estado de líquido a gas se llama:',
    options: ['Condensación', 'Fusión', 'Evaporación', 'Solidificación'],
    correctIndex: 2,
  },
];

interface VocationalQuestionSeed {
  text: string;
  position: number;
  options: { label: string; areaCode: string; position: number }[];
}

const vocationalQuestionsSeed: VocationalQuestionSeed[] = [
  {
    text: '¿Qué actividad disfrutas más en tu tiempo libre?',
    position: 1,
    options: [
      { label: 'Resolver problemas de lógica o programar', areaCode: 'ingenieria', position: 1 },
      { label: 'Cuidar o ayudar a otras personas', areaCode: 'salud', position: 2 },
      { label: 'Leer, escribir o debatir ideas', areaCode: 'social', position: 3 },
      { label: 'Dibujar, diseñar o crear cosas', areaCode: 'arte', position: 4 },
    ],
  },
  {
    text: '¿En qué asignatura te va mejor?',
    position: 2,
    options: [
      { label: 'Matemática', areaCode: 'ingenieria', position: 1 },
      { label: 'Biología / Química', areaCode: 'salud', position: 2 },
      { label: 'Lenguaje / Historia', areaCode: 'social', position: 3 },
      { label: 'Economía / Emprendimiento', areaCode: 'negocios', position: 4 },
    ],
  },
  {
    text: '¿Qué tipo de impacto te gustaría tener?',
    position: 3,
    options: [
      { label: 'Mejorar la salud de las personas', areaCode: 'salud', position: 1 },
      { label: 'Educar y formar a otros', areaCode: 'educacion', position: 2 },
      { label: 'Defender la justicia y los derechos', areaCode: 'derecho', position: 3 },
      { label: 'Crear productos o negocios innovadores', areaCode: 'negocios', position: 4 },
    ],
  },
  {
    text: '¿Cómo prefieres trabajar?',
    position: 4,
    options: [
      { label: 'Con tecnología y datos', areaCode: 'ingenieria', position: 1 },
      { label: 'En equipo, con mucha gente', areaCode: 'social', position: 2 },
      { label: 'Con creatividad y diseño', areaCode: 'arte', position: 3 },
      { label: 'Liderando y tomando decisiones', areaCode: 'negocios', position: 4 },
    ],
  },
  {
    text: '¿Qué frase te representa más?',
    position: 5,
    options: [
      { label: 'Quiero entender cómo funciona todo', areaCode: 'ingenieria', position: 1 },
      { label: 'Quiero cuidar y sanar a los demás', areaCode: 'salud', position: 2 },
      { label: 'Quiero enseñar y dejar huella', areaCode: 'educacion', position: 3 },
      { label: 'Quiero comunicar y mover ideas', areaCode: 'social', position: 4 },
    ],
  },
];

const DEMRE_SOURCE_URL = 'https://demre.cl';

const paesDatesSeed = [
  {
    phase: 'Inscripción',
    title: 'Inicio inscripción PAES',
    dateStart: '2026-06-02',
    dateEnd: '2026-06-02',
    dateLabel: '2 de junio de 2026',
    status: 'Próximo' as const,
    icon: '📝',
  },
  {
    phase: 'Inscripción',
    title: 'Cierre de inscripción',
    dateStart: '2026-08-04',
    dateEnd: '2026-08-04',
    dateLabel: '4 de agosto de 2026',
    status: 'Próximo' as const,
    icon: '⏳',
  },
  {
    phase: 'Rendición',
    title: 'Comp. Lectora y Comp. Matemática 1',
    dateStart: '2026-11-24',
    dateEnd: '2026-11-24',
    dateLabel: '24 de noviembre de 2026',
    status: 'Programado' as const,
    icon: '📖',
  },
  {
    phase: 'Rendición',
    title: 'Historia y Cs. Sociales · Ciencias',
    dateStart: '2026-11-25',
    dateEnd: '2026-11-25',
    dateLabel: '25 de noviembre de 2026',
    status: 'Programado' as const,
    icon: '🔬',
  },
  {
    phase: 'Rendición',
    title: 'Comp. Matemática 2 (electiva)',
    dateStart: '2026-11-26',
    dateEnd: '2026-11-26',
    dateLabel: '26 de noviembre de 2026',
    status: 'Programado' as const,
    icon: '📐',
  },
  {
    phase: 'Resultados',
    title: 'Publicación de puntajes',
    dateStart: '2027-01-02',
    dateEnd: '2027-01-02',
    dateLabel: '2 de enero de 2027',
    status: 'Programado' as const,
    icon: '🎯',
  },
  {
    phase: 'Postulación',
    title: 'Postulación a universidades',
    dateStart: '2027-01-03',
    dateEnd: '2027-01-06',
    dateLabel: '3 al 6 de enero de 2027',
    status: 'Programado' as const,
    icon: '🏛️',
  },
  {
    phase: 'Resultados',
    title: 'Resultados de selección',
    dateStart: '2027-01-19',
    dateEnd: '2027-01-19',
    dateLabel: '19 de enero de 2027',
    status: 'Programado' as const,
    icon: '✅',
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

  await db
    .insert(paesDates)
    .values(paesDatesSeed.map((d) => ({ ...d, sourceUrl: DEMRE_SOURCE_URL })))
    .onConflictDoNothing({ target: [paesDates.phase, paesDates.title] });

  await db
    .insert(paesQuestions)
    .values(paesQuestionsSeed)
    .onConflictDoNothing({ target: [paesQuestions.subject, paesQuestions.mencion, paesQuestions.text] });

  for (const question of vocationalQuestionsSeed) {
    await db
      .insert(vocationalQuestions)
      .values({ text: question.text, position: question.position })
      .onConflictDoNothing({ target: vocationalQuestions.text });

    const [row] = await db
      .select()
      .from(vocationalQuestions)
      .where(eq(vocationalQuestions.text, question.text))
      .limit(1);

    await db
      .insert(vocationalOptions)
      .values(question.options.map((o) => ({ questionId: row.id, ...o })))
      .onConflictDoNothing({ target: [vocationalOptions.questionId, vocationalOptions.label] });
  }

  console.log('Seed completado');
  await client.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
