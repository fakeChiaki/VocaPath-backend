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

    const requiredFactors = (Object.entries(career.weights) as [ScoreFactor, number][])
      .filter(([, weight]) => weight > 0)
      .map(([factor]) => factor);

    const missingFactors = requiredFactors.filter((factor) => !scoresByFactor.has(factor));
    if (missingFactors.length > 0) {
      return {
        career: summary,
        status: 'missing_scores' as const,
        missingFactors,
        weightedScore: null,
      };
    }

    if (career.cutoffScore === null) {
      return {
        career: summary,
        status: 'cutoff_unavailable' as const,
        missingFactors: [],
        weightedScore: null,
      };
    }

    const weightedScore = requiredFactors.reduce((sum, factor) => {
      const weight = career.weights[factor];
      const value = scoresByFactor.get(factor)!;
      return sum + (weight / 100) * value;
    }, 0);
    const roundedScore = Math.round(weightedScore * 100) / 100;

    return {
      career: summary,
      status: (roundedScore >= career.cutoffScore ? 'success' : 'not_enough') as 'success' | 'not_enough',
      missingFactors: [],
      weightedScore: roundedScore,
    };
  }
}
