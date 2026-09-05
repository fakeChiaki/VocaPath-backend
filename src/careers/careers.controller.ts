import { BadRequestException, Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { CareersService } from './careers.service.js';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  findAll(
    @Query('universityId', new ParseUUIDPipe({ optional: true })) universityId?: string,
    @Query('search') search?: string,
  ) {
    return this.careersService.findAll({ universityId, search });
  }

  @Get('compare')
  compare(@Query('ids') idsParam?: string) {
    const ids = (idsParam ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length !== 2 || new Set(ids).size !== 2) {
      throw new BadRequestException('Debes indicar exactamente 2 ids de carreras distintas para comparar');
    }
    if (!ids.every((id) => isUUID(id))) {
      throw new BadRequestException('Los ids deben ser UUID válidos');
    }

    return this.careersService.compare(ids);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.careersService.findById(id);
  }
}
