import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface.js';
import { scoreFactorEnum, type ScoreFactor } from '../database/schema/index.js';
import { SetScoreDto } from './dto/set-score.dto.js';
import { ScoresService } from './scores.service.js';

function parseFactor(value: string): ScoreFactor {
  if (!scoreFactorEnum.enumValues.includes(value as ScoreFactor)) {
    throw new BadRequestException(`Materia inválida. Valores permitidos: ${scoreFactorEnum.enumValues.join(', ')}`);
  }
  return value as ScoreFactor;
}

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.scoresService.findAll(user.id);
  }

  @Put(':factor')
  setManual(@CurrentUser() user: AuthenticatedUser, @Param('factor') factor: string, @Body() dto: SetScoreDto) {
    return this.scoresService.setManual(user.id, parseFactor(factor), dto.value);
  }

  @Delete(':factor')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('factor') factor: string) {
    return this.scoresService.remove(user.id, parseFactor(factor));
  }
}
