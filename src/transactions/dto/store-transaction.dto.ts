import { Transform } from 'class-transformer';
import { IsDate, IsISO8601, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';

export class StoreTransactionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  pricePerKw: number;

  @IsNotEmpty()
  @Transform(({ value }) => Types.ObjectId.createFromHexString(value))
  consumerId: Types.ObjectId;

  @IsNotEmpty()
  @Transform(({ value }) => Types.ObjectId.createFromHexString(value))
  prosumerId: Types.ObjectId;

  @IsDate()
  performedAt: Date;
}
