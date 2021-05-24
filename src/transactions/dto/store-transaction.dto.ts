import { Transform } from 'class-transformer';
import { IsDate, IsISO8601, IsNumber, IsString, Min } from 'class-validator';

export class StoreTransactionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  pricePerKw: number;

  @IsString()
  consumerId: string;

  @IsString()
  prosumerId: string;

  @IsISO8601()
  @Transform(({ value }) => new Date(value))
  performedAt: Date;
}
