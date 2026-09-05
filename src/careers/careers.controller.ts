import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.careersService.findById(id);
  }
}
