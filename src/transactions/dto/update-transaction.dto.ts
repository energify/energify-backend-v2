import { IsString } from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  paymentId: string;
}
