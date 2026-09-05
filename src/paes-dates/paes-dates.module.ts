import { Module } from '@nestjs/common';
import { PaesDatesController } from './paes-dates.controller.js';
import { PaesDatesService } from './paes-dates.service.js';

@Module({
  controllers: [PaesDatesController],
  providers: [PaesDatesService],
})
export class PaesDatesModule {}
