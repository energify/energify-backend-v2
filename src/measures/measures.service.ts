import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { format, fromUnixTime, isWithinInterval } from 'date-fns';
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
  private cache = new Map<number, Measure[]>();
  private isFirstMatch: boolean = true;
  private prices?: IPrice[];
  private transactionsDto = new Array<StoreTransactionDto>();

  constructor(
    @InjectModel(Measure.name) private measureModel: Model<Measure>,
    private usersService: UsersService,
    private transactionsService: TransactionsService,
  ) {}

  store(userId: Types.ObjectId, dto: StoreMeasureDto) {
    if (!this.cache.has(dto.timestamp)) {
      this.cache.set(dto.timestamp, []);
    }

    this.cache.get(dto.timestamp).push({
      ...dto,
      id: new Types.ObjectId().toHexString(),
      userId,
      measuredAt: fromUnixTime(dto.timestamp),
    });
  }

  @Interval(1)
  @NoOverlap()
  async match() {
    const timestamp = Array.from(this.cache.keys())[0];
    const date = fromUnixTime(timestamp);
    if (!timestamp) return;

    if (this.isFirstMatch) {
      this.prices = await this.usersService.findAllPrices();
      this.isFirstMatch = false;
      return;
    }

    if (date.getDay() === 1 && date.getHours() === 0) {
      Logger.log(
        `Matching measures from ${format(date, 'dd/MM/yyyy HH:mm:ss')} (items cached: ${
          this.cache.size
        })`,
      );
    }

    const measures = this.cache.get(timestamp);
    this.cache.delete(timestamp);

    const orders = mergeArrays<Measure, IPrice>(measures, this.prices, 'userId', 'id');
    const matches = new LpfLafPolicy().match(orders);

    for (const match of matches) {
      this.transactionsDto.push({
        amount: match.value,
        consumerId: match.consumerId,
        prosumerId: match.prosumerId,
        performedAt: fromUnixTime(timestamp),
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
