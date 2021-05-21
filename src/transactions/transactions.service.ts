import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeInterval } from '../common/types';
import { timeIntervalToDateIntervals } from '../common/util';
import { AmountsDao } from './dao/amounts.dao';
import { PriceHistoryDao } from './dao/prices-history.dao';
import { StoreTransactionDto } from './dto/store-transaction.dto';
import { Transaction } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(@InjectModel(Transaction.name) private transactionsModel: Model<Transaction>) {}

  async store(dto: StoreTransactionDto) {
    return this.transactionsModel.create(dto);
  }

  async storeBulk(dto: StoreTransactionDto[]) {
    return this.transactionsModel.insertMany(dto);
  }

  async findAll() {
    return this.transactionsModel.find().exec();
  }

  async findPriceByDateInterval(start: Date, end: Date): Promise<number> {
    const [{ pricePerKw }] = await this.transactionsModel.aggregate([
      { $match: { performedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, pricePerKw: { $avg: '$pricePerKw' } } },
    ]);
    return pricePerKw ?? 0;
  }

  async findPriceHistory(end: Date, interval: TimeInterval): Promise<PriceHistoryDao[]> {
    const dateIntervals = timeIntervalToDateIntervals(end, 10, interval);
    const pipeline = {};

    for (const { start, end } of dateIntervals) {
      pipeline[start.toString()] = [
        { $match: { performedAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, pricePerKw: { $avg: '$pricePerKw' } } },
      ];
    }

    return this.transactionsModel.aggregate([{ $facet: pipeline }]);
  }

  async findAmountsByUserId(userId: string, start: Date, end: Date): Promise<AmountsDao> {
    const [{ consumed, produced }] = await this.transactionsModel.aggregate([
      {
        $match: {
          performedAt: { $gte: start, $lte: end },
          $or: [{ consumerId: userId }, { producerId: userId }],
        },
      },
      {
        $group: {
          _id: null,
          consumed: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          produced: { $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] } },
        },
      },
    ]);

    return { consumed: consumed ?? 0, produced: produced ?? 0 };
  }

  async deleteAll() {
    return this.transactionsModel.deleteMany({}).exec();
  }
}
