import { Module } from '@nestjs/common';
import { CareersModule } from '../careers/careers.module.js';
import { VocationalTestsController } from './vocational-tests.controller.js';
import { VocationalTestsService } from './vocational-tests.service.js';

@Module({
  imports: [CareersModule],
  controllers: [VocationalTestsController],
  providers: [VocationalTestsService],
})
export class VocationalTestsModule {}
