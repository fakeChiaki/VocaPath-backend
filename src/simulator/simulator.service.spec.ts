import { describe, it, expect } from 'vitest';
import { SimulatorService } from './simulator.service.js';

type Weights = Record<string, number>;

function buildService(
  career: { cutoffScore: number | null; weights: Weights },
  scores: { factor: string; value: number }[],
) {
  const careersService = {
    findById: async () => ({
      id: 'carrera-1',
      name: 'Medicina',
      universityName: 'UFRO',
      ...career,
    }),
  };
  const scoresService = { findAll: async () => scores };
  return new SimulatorService(careersService as any, scoresService as any);
}

const WEIGHTS: Weights = { nem: 10, ranking: 20, language: 15, math: 45, science: 10 };
const allScores = (value: number) =>
  Object.keys(WEIGHTS).map((factor) => ({ factor, value }));

describe('SimulatorService.simulate', () => {
  it('devuelve success cuando el puntaje ponderado supera el corte', async () => {
    const service = buildService({ cutoffScore: 882.3, weights: WEIGHTS }, allScores(950));
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('success');
    expect(result.weightedScore).toBe(950);
    expect(result.missingFactors).toEqual([]);
  });

  it('devuelve not_enough cuando el puntaje ponderado no alcanza el corte', async () => {
    const service = buildService({ cutoffScore: 882.3, weights: WEIGHTS }, allScores(700));
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('not_enough');
    expect(result.weightedScore).toBe(700);
  });

  it('considera success cuando el puntaje es exactamente igual al corte', async () => {
    const service = buildService({ cutoffScore: 800, weights: WEIGHTS }, allScores(800));
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('success');
  });

  it('bloquea la simulación e indica las materias faltantes', async () => {
    const scores = allScores(900).filter((s) => s.factor !== 'ranking');
    const service = buildService({ cutoffScore: 800, weights: WEIGHTS }, scores);
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('missing_scores');
    expect(result.missingFactors).toEqual(['ranking']);
    expect(result.weightedScore).toBeNull();
  });

  it('ignora las materias con ponderación 0', async () => {
    const weights = { ...WEIGHTS, science: 0 };
    const scores = allScores(900).filter((s) => s.factor !== 'science');
    const service = buildService({ cutoffScore: 800, weights }, scores);
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('success');
    expect(result.missingFactors).toEqual([]);
  });

  it('devuelve cutoff_unavailable cuando la carrera no tiene puntaje de corte', async () => {
    const service = buildService({ cutoffScore: null, weights: WEIGHTS }, allScores(900));
    const result = await service.simulate('user-1', 'carrera-1');
    expect(result.status).toBe('cutoff_unavailable');
    expect(result.weightedScore).toBeNull();
  });
});