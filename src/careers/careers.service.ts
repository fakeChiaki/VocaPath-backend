import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ilike, inArray } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from '../database/database.constants.js';
import type { DrizzleDb } from '../database/database.types.js';
import { areas, careers, universities } from '../database/schema/index.js';

export interface FindCareersFilters {
  universityId?: string;
  search?: string;
}

@Injectable()
export class CareersService {
  constructor(@Inject(DRIZZLE_CLIENT) private readonly db: DrizzleDb) {}

  private baseQuery() {
    return this.db
      .select({
        id: careers.id,
        name: careers.name,
        title: careers.title,
        degree: careers.degree,
        duration: careers.duration,
        regimen: careers.regimen,
        externalCode: careers.externalCode,
        vacantes: careers.vacantes,
        firstSelectedScore: careers.firstSelectedScore,
        cutoffScore: careers.cutoffScore,
        profile: careers.profile,
        weights: careers.weights,
        areaCode: careers.areaCode,
        areaLabel: areas.label,
        universityId: careers.universityId,
        universityName: universities.name,
        universityFullName: universities.fullName,
        universityCity: universities.city,
        universityColor: universities.color,
      })
      .from(careers)
      .innerJoin(universities, eq(careers.universityId, universities.id))
      .innerJoin(areas, eq(careers.areaCode, areas.code));
  }

  findAll(filters: FindCareersFilters) {
    const conditions = [];
    if (filters.universityId) {
      conditions.push(eq(careers.universityId, filters.universityId));
    }
    if (filters.search) {
      conditions.push(ilike(careers.name, `%${filters.search}%`));
    }

    const query = this.baseQuery();
    return conditions.length ? query.where(and(...conditions)) : query;
  }

  findByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.baseQuery().where(inArray(careers.id, ids));
  }

  async findById(id: string) {
    const [career] = await this.baseQuery().where(eq(careers.id, id)).limit(1);
    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }
    return career;
  }

  async compare(ids: string[]) {
    const uniqueIds = Array.from(new Set(ids));
    const results = await this.findByIds(uniqueIds);
    if (results.length !== uniqueIds.length) {
      throw new NotFoundException('Una o más carreras no fueron encontradas');
    }
    return uniqueIds.map((id) => results.find((career) => career.id === id)!);
  }
}
