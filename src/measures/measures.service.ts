import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dateTo15SecondsInterval } from '../common/util';
import { UsersService } from '../users/users.service';
import { StoreMeasureDto } from './dto/store-measure.dto';
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
    return this.measureModel.deleteMany({}).exec();
  }

  async match(prices?: any) {
    const now = new Date();
    const { start, end } = dateTo15SecondsInterval(now);
    const measures = await this.findByDateInterval(start, end);
    prices = prices ?? (await this.usersService.findAllPrices());
  }
}
