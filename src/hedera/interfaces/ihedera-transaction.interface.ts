import { HederaTransactionType } from '../enums/hedera-transaction-types.enum';
import { IHederaTransfer } from './ihedera-transfer.interface';

export interface IHedaraTransaction {
  consensusAt: string;
  hash: string;
  validStartAt: string;
  memo: string;
  status: string;
  type: Partial<Record<HederaTransactionType, any>>;
  fee: number;
  maxFee: string;
  validDuration: string;
  id: string;
  transfers: IHederaTransfer[];
}
