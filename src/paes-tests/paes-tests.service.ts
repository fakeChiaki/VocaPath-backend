import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import {
  paesAttemptAnswers,
  paesAttempts,
  paesQuestions,
  type MencionCiencias,
  type PaesSubject,
} from '../database/schema/index.js';
import { ScoresService } from '../scores/scores.service.js';
import type { SubmitAttemptDto } from './dto/submit-attempt.dto.js';

function validateSubjectMencion(subject: PaesSubject, mencion: MencionCiencias) {
  if (subject === 'ciencias' && mencion === 'ninguna') {
    throw new BadRequestException('Debes indicar una mención para Ciencias');
  }
  if (subject !== 'ciencias' && mencion !== 'ninguna') {
    throw new BadRequestException('La mención solo aplica para la materia Ciencias');
  }
}

function computeScore(correctCount: number, totalCount: number) {
  return Math.round(450 + (correctCount / totalCount) * 550);
}

@Injectable()
export class PaesTestsService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb,
    private readonly scoresService: ScoresService,
  ) {}

  private async findQuestionBank(subject: PaesSubject, mencion: MencionCiencias) {
    validateSubjectMencion(subject, mencion);
    const questions = await this.db
      .select()
      .from(paesQuestions)
      .where(and(eq(paesQuestions.subject, subject), eq(paesQuestions.mencion, mencion)));

    if (questions.length === 0) {
      throw new NotFoundException('No hay preguntas registradas para esa materia');
    }
    return questions;
  }

  async getQuestions(subject: PaesSubject, mencion: MencionCiencias) {
    const questions = await this.findQuestionBank(subject, mencion);
    return questions.map(({ id, text, options }) => ({ id, text, options }));
  }

  async submitAttempt(userId: string, dto: SubmitAttemptDto) {
    const canonicalQuestions = await this.findQuestionBank(dto.subject, dto.mencion);
    const canonicalIds = new Set(canonicalQuestions.map((q) => q.id));
    const answerIds = new Set(dto.answers.map((a) => a.questionId));

    const matchesBank =
      dto.answers.length === canonicalQuestions.length &&
      answerIds.size === canonicalIds.size &&
      [...canonicalIds].every((id) => answerIds.has(id));

    if (!matchesBank) {
      throw new BadRequestException('Las respuestas no coinciden con el banco de preguntas de esa materia');
    }

    const questionsById = new Map(canonicalQuestions.map((q) => [q.id, q]));
    const correctCount = dto.answers.filter((a) => questionsById.get(a.questionId)?.correctIndex === a.selectedIndex)
      .length;
    const totalCount = canonicalQuestions.length;
    const score = computeScore(correctCount, totalCount);

    const attempt = await this.db.transaction(async (tx) => {
      await tx
        .delete(paesAttempts)
        .where(
          and(
            eq(paesAttempts.userId, userId),
            eq(paesAttempts.subject, dto.subject),
            eq(paesAttempts.mencion, dto.mencion),
          ),
        );

      const [created] = await tx
        .insert(paesAttempts)
        .values({
          userId,
          subject: dto.subject,
          mencion: dto.mencion,
          score,
          correctCount,
          totalCount,
        })
        .returning();

      await tx.insert(paesAttemptAnswers).values(
        dto.answers.map((a) => ({
          attemptId: created.id,
          questionId: a.questionId,
          selectedIndex: a.selectedIndex,
        })),
      );

      return created;
    });

    await this.scoresService.upsertFromAttempt(userId, dto.subject, score, attempt.id);

    return {
      attemptId: attempt.id,
      score,
      correctCount,
      totalCount,
      review: dto.answers.map((a) => {
        const question = questionsById.get(a.questionId)!;
        return {
          questionId: question.id,
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          selectedIndex: a.selectedIndex,
        };
      }),
    };
  }

  async getAttemptReview(userId: string, subject: PaesSubject, mencion: MencionCiencias) {
    const [attempt] = await this.db
      .select()
      .from(paesAttempts)
      .where(and(eq(paesAttempts.userId, userId), eq(paesAttempts.subject, subject), eq(paesAttempts.mencion, mencion)))
      .limit(1);

    if (!attempt) {
      throw new NotFoundException('No hay una prueba rendida para esa materia');
    }

    const answers = await this.db
      .select()
      .from(paesAttemptAnswers)
      .where(eq(paesAttemptAnswers.attemptId, attempt.id));

    const questions = await this.db
      .select()
      .from(paesQuestions)
      .where(
        inArray(
          paesQuestions.id,
          answers.map((a) => a.questionId),
        ),
      );
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    return {
      attemptId: attempt.id,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalCount: attempt.totalCount,
      createdAt: attempt.createdAt,
      review: answers.map((a) => {
        const question = questionsById.get(a.questionId)!;
        return {
          questionId: question.id,
          text: question.text,
          options: question.options,
          correctIndex: question.correctIndex,
          selectedIndex: a.selectedIndex,
        };
      }),
    };
  }
}
