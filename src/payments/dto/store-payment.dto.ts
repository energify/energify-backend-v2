import { IsArray, IsDate, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class StorePaymentDto {
  @IsNotEmpty()
  @Transform(({ value }) => Types.ObjectId(value))
  consumerId: Types.ObjectId;

  @IsNotEmpty()
  @Transform(({ value }) => Types.ObjectId(value))
  prosumerId: Types.ObjectId;

  @IsPositive()
  @IsNumber()
  amount: number;

  @IsArray()
  transactionIds: Types.ObjectId[];

  @IsDate()
  issuedAt: Date;
}
