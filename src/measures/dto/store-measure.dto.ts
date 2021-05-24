import { Transform } from 'class-transformer';
import { IsISO8601, IsNumber } from 'class-validator';

export class StoreMeasureDto {
  @IsNumber()
  value: number;

  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  measuredAt: Date;
}
