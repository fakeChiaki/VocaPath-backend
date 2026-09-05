import { IsNumber, Max, Min } from 'class-validator';

export class SetScoreDto {
  @IsNumber()
  @Min(100)
  @Max(1000)
  value: number;
}
