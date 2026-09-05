import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { CareersService } from '../careers/careers.service.js';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import {
  vocationalAttemptAnswers,
  vocationalAttempts,
  vocationalOptions,
  vocationalQuestions,
} from '../database/schema/index.js';

interface VocationalAnswerInput {
  questionId: string;
  optionId: string;
}

@Injectable()
export class VocationalTestsService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb,
    private readonly careersService: CareersService,
  ) {}

  async getQuestions() {
    const questions = await this.db
      .select()
      .from(vocationalQuestions)
      .orderBy(asc(vocationalQuestions.position));
    const options = await this.db
      .select({
        id: vocationalOptions.id,
        questionId: vocationalOptions.questionId,
        label: vocationalOptions.label,
        position: vocationalOptions.position,
      })
      .from(vocationalOptions)
      .orderBy(asc(vocationalOptions.position));

    return questions.map((question) => ({
      id: question.id,
      text: question.text,
      options: options
        .filter((option) => option.questionId === question.id)
        .map(({ id, label }) => ({ id, label })),
    }));
  }

  private async gradeAnswers(answers: VocationalAnswerInput[]) {
    const canonicalQuestions = await this.db.select().from(vocationalQuestions);
    const canonicalIds = new Set(canonicalQuestions.map((q) => q.id));
    const answerIds = new Set(answers.map((a) => a.questionId));

    const matchesBank =
      answers.length === canonicalQuestions.length &&
      answerIds.size === canonicalIds.size &&
      [...canonicalIds].every((id) => answerIds.has(id));

    if (!matchesBank) {
      throw new BadRequestException('Las respuestas no coinciden con el banco de preguntas del test vocacional');
    }

    const options = await this.db
      .select()
      .from(vocationalOptions)
      .where(
        inArray(
          vocationalOptions.id,
          answers.map((a) => a.optionId),
        ),
      );
    const optionsById = new Map(options.map((o) => [o.id, o]));

    const affinity: Record<string, number> = {};
    for (const answer of answers) {
      const option = optionsById.get(answer.optionId);
      if (!option || option.questionId !== answer.questionId) {
        throw new BadRequestException('Una de las opciones no corresponde a la pregunta indicada');
      }
      affinity[option.areaCode] = (affinity[option.areaCode] ?? 0) + 1;
    }

    return affinity;
  }

  private async buildResult(affinity: Record<string, number>) {
    const maxCount = Math.max(...Object.values(affinity));
    const topAreas = Object.entries(affinity)
      .filter(([, count]) => count === maxCount)
      .map(([area]) => area);
    const recommendedCareers = await this.careersService.findByAreaCodes(topAreas);
    return { affinity, topAreas, recommendedCareers };
  }

  async submitAttempt(userId: string, answers: VocationalAnswerInput[]) {
    const affinity = await this.gradeAnswers(answers);

    const attempt = await this.db.transaction(async (tx) => {
      const [created] = await tx.insert(vocationalAttempts).values({ userId, affinity }).returning();
      await tx.insert(vocationalAttemptAnswers).values(
        answers.map((a) => ({
          attemptId: created.id,
          questionId: a.questionId,
          optionId: a.optionId,
        })),
      );
      return created;
    });

    const result = await this.buildResult(affinity);
    return { attemptId: attempt.id, createdAt: attempt.createdAt, ...result };
  }

  async findAttempts(userId: string) {
    const attempts = await this.db
      .select()
      .from(vocationalAttempts)
      .where(eq(vocationalAttempts.userId, userId))
      .orderBy(desc(vocationalAttempts.createdAt));

    return Promise.all(
      attempts.map(async (attempt) => ({
        attemptId: attempt.id,
        createdAt: attempt.createdAt,
        ...(await this.buildResult(attempt.affinity as Record<string, number>)),
      })),
    );
  }
}
