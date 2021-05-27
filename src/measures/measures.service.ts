import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { fromUnixTime } from 'date-fns';
import { Model, Types } from 'mongoose';
import { dateTo15SecondsInterval, mergeArrays } from '../common/util';
import { StoreTransactionDto } from '../transactions/dto/store-transaction.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { IPrice } from '../users/interfaces/iprices.interface';
import { UsersService } from '../users/users.service';
import { StoreMeasureDto } from './dto/store-measure.dto';
import { LpfLafPolicy } from './models/lpflaf-policy.model';
import { Measure } from './schemas/measure.schema';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectModel(Measure.name) private measureModel: Model<Measure>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  async store(userId: Types.ObjectId, dto: StoreMeasureDto) {
    return this.measureModel.create({ ...dto, userId, measuredAt: fromUnixTime(dto.timestamp) });
  }

  async storeBulk(userId: Types.ObjectId, dto: StoreMeasureDto[]) {
    const dtoWithUserId = dto.map((e) => ({ ...e, userId, measuredAt: fromUnixTime(e.timestamp) }));
    return this.measureModel.insertMany(dtoWithUserId);
  }

  async findAll() {
    return this.measureModel.find();
  }

  async deleteByIds(ids: string[]) {
    return this.measureModel.deleteMany({ _id: { $in: ids } });
  }

  async findByDateInterval(start: Date, end: Date) {
    return this.measureModel.find({ measuredAt: { $gte: start, $lte: end } });
  }

  async findOldest() {
    return this.measureModel.find({}).sort({ measuredAt: 1 }).limit(1);
  }

  async deleteAll() {
    return this.measureModel.deleteMany();
  }

  @Interval(1000)
  async match() {
    const measure = (await this.findOldest())[0];

    if (!measure) {
      return;
    }

    const { start, end } = dateTo15SecondsInterval(new Date(measure.measuredAt));
    const measures = await this.findByDateInterval(start, end);
    const prices = await this.usersService.findAllPrices();
    const orders = mergeArrays<Measure, IPrice>(measures, prices, 'userId', 'id');
    const matches = new LpfLafPolicy().match(orders);
    const transactionsDto = new Array<StoreTransactionDto>();

    for (const match of matches) {
      transactionsDto.push({
        amount: match.value,
        consumerId: match.consumerId,
        prosumerId: match.prosumerId,
        performedAt: new Date(),
        pricePerKw: match.pricePerKw,
      });
    }

    await this.transactionsService.storeBulk(transactionsDto);
    await this.deleteByIds(measures.map((m) => m.id));
  }
}
