import { Type } from 'class-transformer';
import { ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';

class VocationalAnswerDto {
  @IsUUID()
  questionId: string;

  @IsUUID()
  optionId: string;
}

export class SubmitVocationalAttemptDto {
  @ValidateNested({ each: true })
  @Type(() => VocationalAnswerDto)
  @ArrayMinSize(1)
  answers: VocationalAnswerDto[];
}
