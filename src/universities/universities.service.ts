import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import { universities } from '../database/schema/index.js';

@Injectable()
export class UniversitiesService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  findAll() {
    return this.db.select().from(universities).orderBy(universities.name);
  }

  async findById(id: string) {
    const [university] = await this.db.select().from(universities).where(eq(universities.id, id)).limit(1);
    if (!university) {
      throw new NotFoundException('Universidad no encontrada');
    }
    return university;
  }
}
