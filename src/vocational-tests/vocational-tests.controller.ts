import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface.js';
import { SubmitVocationalAttemptDto } from './dto/submit-vocational-attempt.dto.js';
import { VocationalTestsService } from './vocational-tests.service.js';

@Controller('vocational-tests')
export class VocationalTestsController {
  constructor(private readonly vocationalTestsService: VocationalTestsService) {}

  @Get('questions')
  getQuestions() {
    return this.vocationalTestsService.getQuestions();
  }

  @Post('attempts')
  submitAttempt(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitVocationalAttemptDto) {
    return this.vocationalTestsService.submitAttempt(user.id, dto.answers);
  }

  @Get('attempts')
  findAttempts(@CurrentUser() user: AuthenticatedUser) {
    return this.vocationalTestsService.findAttempts(user.id);
  }
}
