import { Inject, Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import { paesDates } from '../database/schema/index.js';

@Injectable()
export class PaesDatesService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  findAll() {
    return this.db.select().from(paesDates).orderBy(asc(paesDates.dateStart));
  }
}
