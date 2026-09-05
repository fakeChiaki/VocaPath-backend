import { Type } from 'class-transformer';
import { ArrayMinSize, IsIn, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { mencionCienciasEnum, paesSubjectEnum, type MencionCiencias, type PaesSubject } from '../../database/schema/index.js';

class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsInt()
  @Min(0)
  selectedIndex: number;
}

export class SubmitAttemptDto {
  @IsIn(paesSubjectEnum.enumValues)
  subject: PaesSubject;

  @IsOptional()
  @IsIn(mencionCienciasEnum.enumValues)
  mencion: MencionCiencias = 'ninguna';

  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(1)
  answers: AnswerDto[];
}
