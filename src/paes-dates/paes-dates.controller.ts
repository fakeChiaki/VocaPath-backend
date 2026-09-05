import { Controller, Get } from '@nestjs/common';
import { PaesDatesService } from './paes-dates.service.js';

@Controller('paes-dates')
export class PaesDatesController {
  constructor(private readonly paesDatesService: PaesDatesService) {}

  @Get()
  findAll() {
    return this.paesDatesService.findAll();
  }
}
