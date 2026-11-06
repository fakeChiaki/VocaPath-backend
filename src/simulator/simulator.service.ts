import { Injectable } from '@nestjs/common';
import { CareersService } from '../careers/careers.service.js';
import type { ScoreFactor } from '../database/schema/index.js';
import { ScoresService } from '../scores/scores.service.js';

@Injectable()
export class SimulatorService {
  constructor(
    private readonly careersService: CareersService,
    private readonly scoresService: ScoresService,
  ) {}

  async simulate(userId: string, careerId: string) {
    const career = await this.careersService.findById(careerId);
    const userScores = await this.scoresService.findAll(userId);
    const scoresByFactor = new Map(userScores.map((s) => [s.factor, s.value]));

    const summary = {
      id: career.id,
      name: career.name,
      universityName: career.universityName,
      cutoffScore: career.cutoffScore,
    };

    const { historiaOCiencias, ...factorWeights } = career.weights;
    const requiredFactors = (Object.entries(factorWeights) as [ScoreFactor, number][])
      .filter(([factor, weight]) => weight > 0 && !(historiaOCiencias && (factor === 'historia' || factor === 'ciencias')))
      .map(([factor]) => factor);

    const missingFactors = requiredFactors.filter((factor) => !scoresByFactor.has(factor));
    const historiaCiencias = [scoresByFactor.get('historia'), scoresByFactor.get('ciencias')].filter(
      (v): v is number => v !== undefined,
    );
    const missingAnyOf = historiaOCiencias && historiaCiencias.length === 0 ? (['historia', 'ciencias'] as const) : null;

    if (missingFactors.length > 0 || missingAnyOf) {
      return {
        career: summary,
        status: 'missing_scores' as const,
        missingFactors,
        missingAnyOf,
        weightedScore: null,
      };
    }

    if (career.cutoffScore === null) {
      return {
        career: summary,
        status: 'cutoff_unavailable' as const,
        missingFactors: [],
        missingAnyOf: null,
        weightedScore: null,
      };
    }

    let weightedScore = requiredFactors.reduce((sum, factor) => {
      const weight = factorWeights[factor];
      const value = scoresByFactor.get(factor)!;
      return sum + (weight / 100) * value;
    }, 0);
    if (historiaOCiencias) {
      weightedScore += (Math.max(factorWeights.historia, factorWeights.ciencias) / 100) * Math.max(...historiaCiencias);
    }
    const roundedScore = Math.round(weightedScore * 100) / 100;

    return {
      career: summary,
      status: (roundedScore >= career.cutoffScore ? 'success' : 'not_enough') as 'success' | 'not_enough',
      missingFactors: [],
      missingAnyOf: null,
      weightedScore: roundedScore,
    };
  }
}
