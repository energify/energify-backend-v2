import { IsString } from 'class-validator';

export class CompletePaymentDto {
  @IsString()
  hederaTransactionHash: string;
}
