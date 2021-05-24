import { IsNumber } from 'class-validator';

export class StoreMeasureDto {
  @IsNumber()
  value: number;

  @IsNumber()
  timestamp: number;
}
