import { IsArray, IsDate, IsNumber, IsPositive, IsString } from 'class-validator';

export class StorePaymentDto {
  @IsString()
  consumerId: string;

  @IsString()
  prosumerId: string;

  @IsPositive()
  @IsNumber()
  amount: number;

  @IsArray()
  transactionIds: string[];

  @IsDate()
  issuedAt: Date;
}
