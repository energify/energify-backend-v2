import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dateTo15SecondsInterval, mergeArrays } from '../common/util';
import { StoreTransactionDto } from '../transactions/dto/store-transaction.dto';
import { IPrice } from '../users/interfaces/iprices.interface';
import { UsersService } from '../users/users.service';
import { StoreMeasureDto } from './dto/store-measure.dto';
import { MatchingPolicy } from './models/matching-policy.model';
import { Measure } from './schemas/measure.schema';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectModel(Measure.name) private measureModel: Model<Measure>,
    private usersService: UsersService,
  ) {}

  async store(userId: string, dto: StoreMeasureDto) {
    return this.measureModel.create({ ...dto, userId });
  }

  async storeBulk(userId: string, dto: StoreMeasureDto[]) {
    const dtoWithUserId = dto.map((e) => ({ ...e, userId }));
    return this.measureModel.insertMany(dtoWithUserId);
  }

  async findAll() {
    return this.measureModel.find().exec();
  }

  async findByDateInterval(start: Date, end: Date) {
    return this.measureModel.find({ measuredAt: { $gte: start, $lte: end } });
  }

  async deleteAll() {
    return this.measureModel.deleteMany();
  }

  async match(policy: MatchingPolicy, measures?: Measure[], prices?: IPrice[]) {
    const transactions = new Array<StoreTransactionDto>();
    const { start, end } = dateTo15SecondsInterval(new Date());
    measures = measures ?? (await this.findByDateInterval(start, end));
    prices = prices ?? (await this.usersService.findAllPrices());
    const orders = mergeArrays<Measure, IPrice>(measures, prices, 'userId', '_id');
    return policy.match(orders);
  }
}
