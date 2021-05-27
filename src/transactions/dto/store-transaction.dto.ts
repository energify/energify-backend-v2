import { Transform } from 'class-transformer';
import { IsDate, IsISO8601, IsNumber, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';

export class StoreTransactionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  pricePerKw: number;

  @IsString()
  @Transform(({ value }) => Types.ObjectId(value))
  consumerId: Types.ObjectId;

  @IsString()
  @Transform(({ value }) => Types.ObjectId(value))
  prosumerId: Types.ObjectId;

  @IsDate()
  performedAt: Date;
}
