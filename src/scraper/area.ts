const AREA_RULES: [area: string, pattern: RegExp][] = [
  ['educacion', /pedagogia|parvulos|psicopedagogia/],
  ['derecho', /^derecho/],
  ['social', /administracion publica/],
  ['negocios', /administracion|comercial|contador|control de gestion/],
  ['arte', /diseno|arquitectura|artes visuales|animacion|oficios creativos/],
  ['salud', /medicina|enfermeria|kinesiologia|fonoaudiologia|nutricion|obstetricia|odontologia|farmacia|terapia ocupacional|tecnologia medica/],
  ['social', /periodismo|trabajo social|sociologia|antropologia|arqueologia|ciencia politica|psicologia|filosofia|traduccion|bachiller/],
  ['ingenieria', /ingenieria|plan comun|geologia|agronomia|bioquimica|biotecnologia|construccion/],
];

export function areaFor(careerName: string) {
  const name = careerName.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return AREA_RULES.find(([, pattern]) => pattern.test(name))?.[0] ?? null;
}
