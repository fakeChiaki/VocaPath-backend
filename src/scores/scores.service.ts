import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import { paesAttempts, userScores, type ScoreFactor } from '../database/schema/index.js';

@Injectable()
export class ScoresService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  findAll(userId: string) {
    return this.db.select().from(userScores).where(eq(userScores.userId, userId));
  }

  async setManual(userId: string, factor: ScoreFactor, value: number) {
    await this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(userScores)
        .where(and(eq(userScores.userId, userId), eq(userScores.factor, factor)))
        .limit(1);

      if (existing?.attemptId) {
        await tx.delete(paesAttempts).where(eq(paesAttempts.id, existing.attemptId));
      }

      await tx
        .insert(userScores)
        .values({ userId, factor, value, source: 'manual' })
        .onConflictDoUpdate({
          target: [userScores.userId, userScores.factor],
          set: { value, source: 'manual', attemptId: null, updatedAt: new Date() },
        });
    });
  }

  async upsertFromAttempt(userId: string, factor: ScoreFactor, value: number, attemptId: string) {
    await this.db
      .insert(userScores)
      .values({ userId, factor, value, source: 'paes_attempt', attemptId })
      .onConflictDoUpdate({
        target: [userScores.userId, userScores.factor],
        set: { value, source: 'paes_attempt', attemptId, updatedAt: new Date() },
      });
  }

  async remove(userId: string, factor: ScoreFactor) {
    const [score] = await this.db
      .select()
      .from(userScores)
      .where(and(eq(userScores.userId, userId), eq(userScores.factor, factor)))
      .limit(1);

    if (!score) {
      throw new NotFoundException('No hay un puntaje registrado para esa materia');
    }

    if (score.attemptId) {
      await this.db.delete(paesAttempts).where(eq(paesAttempts.id, score.attemptId));
    } else {
      await this.db.delete(userScores).where(eq(userScores.id, score.id));
    }
  }
}
