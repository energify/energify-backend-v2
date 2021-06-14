import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromUnixTime, isAfter } from 'date-fns';
import fetch from 'node-fetch';
import { IHedaraTransaction } from './interfaces/ihedera-transaction.interface';

@Injectable()
export class HederaService {
  constructor(private configService: ConfigService) {}

  async fetchTransactionByHash(hash: string): Promise<IHedaraTransaction> {
    const baseUrl = this.configService.get<string>('HEDERA_MIRROR_URL');
    const response = await fetch(`${baseUrl}/transaction/${hash}`);
    return response.json();
  }

  async didTransferOccur(
    fromId: string,
    toId: string,
    amount: number,
    hash: string,
    paymentIssueDate: Date,
  ) {
    try {
      const transaction = await this.fetchTransactionByHash(hash);
      const isCorrectSender = !!transaction.transfers.find((t) => t.account === fromId);
      const isCorrectReceiver = !!transaction.transfers.find(
        (t) => t.account === toId && t.amount === amount * 100000000,
      );

      return (
        isCorrectSender &&
        isCorrectReceiver &&
        isAfter(new Date(transaction.validStartAt), paymentIssueDate)
      );
    } catch (e) {
      return false;
    }
  }
}
