import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { fromUnixTime } from 'date-fns';
import { Model } from 'mongoose';
import { dateTo15SecondsInterval, mergeArrays } from '../common/util';
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
  ) {}

  async store(userId: string, dto: StoreMeasureDto) {
    return this.measureModel.create({ ...dto, userId, measuredAt: fromUnixTime(dto.timestamp) });
  }

  async storeBulk(userId: string, dto: StoreMeasureDto[]) {
    const dtoWithUserId = dto.map((e) => ({ ...e, userId, measuredAt: fromUnixTime(e.timestamp) }));
    return this.measureModel.insertMany(dtoWithUserId);
  }

  async findAll() {
    return this.measureModel.find();
  }

  async deleteByIds(ids: string[]) {
    return this.measureModel.deleteMany({ id: { $in: ids } });
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

  @Interval(2000)
  async match(measures?: Measure[], prices?: IPrice[]) {
    const measure = (await this.findOldest())[0];

    if (!measure) {
      return;
    }

    const { start, end } = dateTo15SecondsInterval(new Date(measure.measuredAt));
    measures = measures ?? (await this.findByDateInterval(start, end));
    prices = prices ?? (await this.usersService.findAllPrices());

    console.log({ start, end });
    console.log(measures);
    console.log(prices);

    const orders = mergeArrays<Measure, IPrice>(measures, prices, 'userId', '_id');
    console.log(new LpfLafPolicy().match(orders));
    await this.deleteByIds(measures.map((m) => m._id));
  }
}
