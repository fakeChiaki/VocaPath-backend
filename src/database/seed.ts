import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import {
  areas,
  paesDates,
  paesQuestions,
  vocationalQuestions,
  vocationalOptions,
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
