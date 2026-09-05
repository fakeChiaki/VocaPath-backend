import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UniversitiesService } from './universities.service.js';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.universitiesService.findById(id);
  }
}
