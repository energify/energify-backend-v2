import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { lastDayOfMonth, parse, subMinutes } from 'date-fns';
import { Model, Types } from 'mongoose';
import { TimeInterval } from '../common/types';
import { timeIntervalToDateIntervals } from '../common/util';
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
    return this.transactionsModel.find();
  }

  async findReadyForPayment(now: Date) {
    return this.transactionsModel.find({
      performedAt: { $lte: subMinutes(now, 15) },
      isPaymentIssued: false,
      prosumerId: { $ne: null },
      consumerId: { $ne: null },
    });
  }

  async findOldestReadyForPayment() {
    return this.transactionsModel.findOne(
      { isPaymentIssued: false, prosumerId: { $ne: null }, consumerId: { $ne: null } },
      {},
      { sort: { performedAt: 1 } },
    );
  }

  async findAmountByIds(ids: Types.ObjectId[]) {
    const [result] = await this.transactionsModel.aggregate([
      { $match: { _id: { $in: ids } } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ]);

    return result?.amount ?? 0;
  }

  async findPriceByDateInterval(start: Date, end: Date) {
    const [result] = await this.transactionsModel.aggregate([
      { $match: { performedAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, pricePerKw: { $avg: '$pricePerKw' } } },
    ]);

    return result?.pricePerKw ?? 0;
  }

  async findPriceHistory(end: Date, interval: TimeInterval) {
    const dateIntervals = timeIntervalToDateIntervals(end, 12, interval);
    const results = [];

    for (const { start, end } of dateIntervals) {
      results.push(
        await this.transactionsModel.aggregate([
          { $match: { performedAt: { $gt: start, $lt: end } } },
          { $group: { _id: null, pricePerKw: { $avg: '$pricePerKw' } } },
        ]),
      );
    }

    return Object.values(results)
      .map((el) => el[0]?.pricePerKw ?? 0)
      .reverse();
  }

  async findAmountsByUserId(userId: Types.ObjectId, start: Date, end: Date) {
    const [result] = await this.transactionsModel.aggregate([
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

    return { consumed: result?.consumed ?? 0, produced: result?.produced ?? 0 };
  }

  async findAmountsHistoryByUserId(userId: Types.ObjectId, end: Date, interval: TimeInterval) {
    const dateIntervals = timeIntervalToDateIntervals(end, 12, interval);
    const results = [];

    for (const { start, end } of dateIntervals) {
      results.push(
        await this.transactionsModel.aggregate([
          {
            $match: {
              performedAt: { $gte: start, $lte: end },
              $or: [{ consumerId: userId }, { prosumerId: userId }],
            },
          },
          {
            $group: {
              _id: null,
              consumed: { $sum: { $cond: [{ $eq: ['$consumerId', userId] }, '$amount', 0] } },
              produced: { $sum: { $cond: [{ $eq: ['$prosumerId', userId] }, '$amount', 0] } },
            },
          },
        ]),
      );
    }

    return Object.values(results)
      .map((el) => ({ produced: el[0]?.produced ?? 0, consumed: el[0]?.consumed ?? 0 }))
      .reverse();
  }

  async findAmountsFlowByUserId(userId: Types.ObjectId, start: Date, end: Date) {
    const [results] = await this.transactionsModel.aggregate([
      {
        $match: {
          performedAt: { $gte: start, $lte: end },
          $or: [{ consumerId: userId }, { prosumerId: userId }],
        },
      },
      {
        $group: {
          _id: null,
          fromCommunity: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$consumerId', userId] }, { $ne: ['$prosumerId', null] }] },
                '$amount',
                0,
              ],
            },
          },
          toCommunity: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$prosumerId', userId] }, { $ne: ['$consumerId', null] }] },
                '$amount',
                0,
              ],
            },
          },
          toPublicGrid: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$prosumerId', userId] }, { $eq: ['$consumerId', null] }] },
                '$amount',
                0,
              ],
            },
          },
          fromPublicGrid: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$consumerId', userId] }, { $eq: ['$prosumerId', null] }] },
                '$amount',
                0,
              ],
            },
          },
        },
      },
    ]);

    return {
      fromPublicGrid: results?.fromPublicGrid ?? 0,
      fromCommunity: results?.fromCommunity ?? 0,
      toCommunity: results?.toCommunity ?? 0,
      toPublicGrid: results?.toPublicGrid ?? 0,
    };
  }

  async findMonthlyResumeByUserId(userId: Types.ObjectId, month: number, year: number) {
    const start = parse(`0${month}-01-${year}`, 'MM-dd-yyyy', new Date());
    const end = lastDayOfMonth(start);

    const [result] = await this.transactionsModel.aggregate([
      {
        $match: {
          performedAt: { $gte: start, $lte: end },
          $or: [{ consumerId: userId }, { prosumerId: userId }],
        },
      },
      {
        $group: {
          _id: null,
          consumed: { $sum: { $cond: [{ $eq: ['$consumerId', userId] }, '$amount', 0] } },
          produced: { $sum: { $cond: [{ $eq: ['$prosumerId', userId] }, '$amount', 0] } },
          moneyToCommunity: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$consumerId', userId] }, { $ne: ['$prosumerId', null] }] },
                { $multiply: ['$amount', '$pricePerKw'] },
                0,
              ],
            },
          },
          moneyFromCommunity: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$prosumerId', userId] }, { $ne: ['$consumerId', null] }] },
                { $multiply: ['$amount', '$pricePerKw'] },
                0,
              ],
            },
          },
        },
      },
    ]);
    const { toPublicGrid, fromPublicGrid } = await this.findAmountsFlowByUserId(userId, start, end);
    const usedEnergy = Math.abs((result?.produced ?? 0) - (result?.consumed ?? 0));

    return {
      usedEnergy,
      emmitedCo2: usedEnergy * 0.475,
      moneySpent:
        (result?.moneyFromCommunity ?? 0) -
        (result?.moneyToCommunity ?? 0) +
        (fromPublicGrid * 0.21 - toPublicGrid * 0.21),
    };
  }

  async deleteAll() {
    return this.transactionsModel.deleteMany({});
  }
}
