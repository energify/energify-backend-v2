import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fromUnixTime, isAfter } from 'date-fns';
import fetch from 'node-fetch';
import { IHedaraTransaction } from './interfaces/ihedera-transaction.interface';

@Injectable()
export class HederaService {
  constructor(private configService: ConfigService) {}

  async fetchAccountTransfers(accountId: string) {
    const baseUrl = this.configService.get<string>('HEDERA_MIRROR_URL');
    const data = await fetch(
      `${baseUrl}/api/v1/transactions?account.id=${accountId}&transactionType=CRYPTOTRANSFER`,
    );
    const { transactions } = await data.json();
    return transactions as IHedaraTransaction[];
  }

  async didTransferOccur(
    fromId: string,
    toId: string,
    amount: number,
    transactionId: string,
    paymentIssueDate: Date,
  ) {
    const transfers = await this.fetchAccountTransfers(fromId);
    const transfer = transfers.find((t) => t.transaction_id === transactionId);
    const to = transfer?.transfers.find((t) => t.account === toId);

    if (!transfer || !to || transfer.result !== 'SUCCESS') {
      return false;
    }

    return (
      to.amount === amount &&
      isAfter(fromUnixTime(parseFloat(transfer.consensus_timestamp)), paymentIssueDate)
    );
  }
}
