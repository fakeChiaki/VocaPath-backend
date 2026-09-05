import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface.js';
import {
  mencionCienciasEnum,
  paesSubjectEnum,
  type MencionCiencias,
  type PaesSubject,
} from '../database/schema/index.js';
import { SubmitAttemptDto } from './dto/submit-attempt.dto.js';
import { PaesTestsService } from './paes-tests.service.js';

function parseSubject(value: string): PaesSubject {
  if (!paesSubjectEnum.enumValues.includes(value as PaesSubject)) {
    throw new BadRequestException(`Materia inválida. Valores permitidos: ${paesSubjectEnum.enumValues.join(', ')}`);
  }
  return value as PaesSubject;
}

function parseMencion(value: string | undefined): MencionCiencias {
  const mencion = value ?? 'ninguna';
  if (!mencionCienciasEnum.enumValues.includes(mencion as MencionCiencias)) {
    throw new BadRequestException(`Mención inválida. Valores permitidos: ${mencionCienciasEnum.enumValues.join(', ')}`);
  }
  return mencion as MencionCiencias;
}

@Controller('paes-tests')
export class PaesTestsController {
  constructor(private readonly paesTestsService: PaesTestsService) {}

  @Get('questions')
  getQuestions(@Query('subject') subject: string, @Query('mencion') mencion?: string) {
    return this.paesTestsService.getQuestions(parseSubject(subject), parseMencion(mencion));
  }

  @Post('attempts')
  submitAttempt(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitAttemptDto) {
    return this.paesTestsService.submitAttempt(user.id, dto);
  }

  @Get('attempts/:subject')
  getAttemptReview(
    @CurrentUser() user: AuthenticatedUser,
    @Param('subject') subject: string,
    @Query('mencion') mencion?: string,
  ) {
    return this.paesTestsService.getAttemptReview(user.id, parseSubject(subject), parseMencion(mencion));
  }
}
