import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { CareersService } from '../careers/careers.service.js';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import { userFavorites } from '../database/schema/index.js';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb,
    private readonly careersService: CareersService,
  ) {}

  async findAll(userId: string) {
    const favorites = await this.db
      .select({ careerId: userFavorites.careerId })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    return this.careersService.findByIds(favorites.map((f) => f.careerId));
  }

  async add(userId: string, careerId: string) {
    await this.careersService.findById(careerId);
    await this.db.insert(userFavorites).values({ userId, careerId }).onConflictDoNothing();
  }

  async remove(userId: string, careerId: string) {
    await this.db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.careerId, careerId)));
  }
}
