import { IsArray, IsDate, IsNumber, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class StorePaymentDto {
  @IsString()
  @Transform(({ value }) => Types.ObjectId(value))
  consumerId: Types.ObjectId;

  @IsString()
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
