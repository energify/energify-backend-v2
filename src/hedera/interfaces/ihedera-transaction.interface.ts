import { HederaTransactionType } from '../enums/hedera-transaction-types.enum';
import { IHederaTransfer } from './ihedera-transfer.interface';

export interface IHedaraTransaction {
  consensus_timestamp: string;
  transaction_hash: string;
  valid_start_timestamp: string;
  charged_tx_fee: number;
  memo_base64: string;
  result: string;
  name: Partial<Record<HederaTransactionType, any>>;
  max_fee: string;
  valid_duration_seconds: string;
  node: string;
  transaction_id: string;
  transfers: IHederaTransfer[];
}
