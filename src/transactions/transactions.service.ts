import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findPriceByDateInterval(start: Date, end: Date) {
    const [{ price }] = await this.transactionsModel.aggregate([
      { $match: { performedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, price: { $avg: '$pricePerKw' } } },
    ]);
    return price ?? (0 as number);
  }

  async findAmountsByUserId(userId: string, start: Date, end: Date) {
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

    return { consumed: (consumed ?? 0) as number, produced: (produced ?? 0) as number };
  }

  async deleteAll() {
    return this.transactionsModel.deleteMany({}).exec();
  }
}
