import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { fromUnixTime, isWithinInterval } from 'date-fns';
import { Model, Types } from 'mongoose';
import { NoOverlap } from '../common/decorators/noverlap.decorator';
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
  private cache = new Array<Measure>();
  private isFirstMatch: boolean = true;
  private prices?: IPrice[];
  private transactionsDto = new Array<StoreTransactionDto>();

  constructor(
    @InjectModel(Measure.name) private measureModel: Model<Measure>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  store(userId: Types.ObjectId, dto: StoreMeasureDto) {
    this.cache.push({
      ...dto,
      id: new Types.ObjectId().toHexString(),
      userId,
      measuredAt: fromUnixTime(dto.timestamp),
    });
  }

  storeBulk(userId: Types.ObjectId, dto: StoreMeasureDto[]) {
    const dtosWithUserId = dto.map((e) => ({
      ...e,
      id: new Types.ObjectId().toHexString(),
      userId,
      measuredAt: fromUnixTime(e.timestamp),
    }));
    this.cache.push(...dtosWithUserId);
  }

  findAll() {
    return this.cache;
  }

  deleteByIds(ids: string[]) {
    this.cache = this.cache.filter((el) => !ids.includes(el.id));
  }

  findByDateInterval(start: Date, end: Date) {
    return this.cache.filter((el) => isWithinInterval(el.measuredAt, { start, end }));
  }

  findOldest() {
    return this.cache.sort((el1, el2) => el2.measuredAt.getTime() - el1.measuredAt.getTime());
  }

  deleteAll() {
    this.cache = [];
  }

  @Interval(1)
  @NoOverlap()
  async match() {
    const measure = this.findOldest()[0];
    if (!measure) return;

    if (this.isFirstMatch) {
      this.prices = await this.usersService.findAllPrices();
      this.isFirstMatch = false;
      return;
    }

    const { start, end } = dateTo15SecondsInterval(new Date(measure.measuredAt));

    Logger.log(`Matching measures from ${start} to ${end} (items cached: ${this.cache.length})`);

    const measures = this.findByDateInterval(start, end);
    this.deleteByIds(measures.map((m) => m.id));

    const orders = mergeArrays<Measure, IPrice>(measures, this.prices, 'userId', 'id');
    const matches = new LpfLafPolicy().match(orders);

    for (const match of matches) {
      this.transactionsDto.push({
        amount: match.value,
        consumerId: match.consumerId,
        prosumerId: match.prosumerId,
        performedAt: start,
        pricePerKw: match.pricePerKw,
      });
    }

    if (this.transactionsDto.length > 5000) {
      Logger.log(`${this.transactionsDto.length} transactions stored.`);
      await this.transactionsService.storeBulk(this.transactionsDto);
      this.transactionsDto = [];
    }
  }
}
