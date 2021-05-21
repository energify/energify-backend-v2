import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresService } from './measures.service';
import { Measure, MeasureSchema } from './schemas/measure.schema';
import { performance } from 'perf_hooks';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreMeasureDto } from './dto/store-measure.dto';
import { LpfLafPolicy } from './models/lpflaf-policy.model';
import { UsersModule } from '../users/users.module';
import { IPrice } from '../users/interfaces/iprices.interface';

jest.setTimeout(50000);

describe('MeasuresService', () => {
  let service: MeasuresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
        }),
        MongooseModule.forFeature([{ name: Measure.name, schema: MeasureSchema }]),
        UsersModule,
      ],
      providers: [MeasuresService],
    }).compile();

    service = module.get<MeasuresService>(MeasuresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean the document', async () => {
    await service.deleteAll();
    const measures = await service.findAll();
    expect(measures).toHaveLength(0);
  });

  it('should store 2 measure', async () => {
    const userId = Math.random() < 0.5 ? 'abc' : 'def';
    let measure = await service.store(userId, { value: 1, measuredAt: new Date('12-22-2020') });
    expect(measure.value).toBe(1);
    measure = await service.store(userId, { value: 2, measuredAt: new Date('12-22-2020') });
    expect(measure.value).toBe(2);
  });

  it('should find 2 measures between 21-12-2020 and 24-12-2020', async () => {
    const measures = await service.findByDateInterval(
      new Date('12-22-2020'),
      new Date('12-22-2020'),
    );

    expect(measures).toHaveLength(2);
  });

  it('should store 8000 measures under 1 second', async () => {
    const measures = new Array<StoreMeasureDto>();
    const userId = Math.random() < 0.5 ? 'abc' : 'def';

    for (let i = 0; i < 8000; i++) {
      measures.push({
        value: Math.random() < 0.5 ? Math.random() * -10 : Math.random(),
        measuredAt: new Date(),
      });
    }

    const t1 = performance.now();
    service.storeBulk(userId, measures);
    const t2 = performance.now();
    expect(t2 - t1).toBeLessThanOrEqual(1000);
  });

  it('should retrive 8000 measures 10 times under 4 seconds each', async () => {
    for (let i = 0; i < 10; i++) {
      const t1 = performance.now();
      const measures = await service.findAll();
      const t2 = performance.now();
      expect(t2 - t1).toBeLessThanOrEqual(4000);
      expect(measures).toHaveLength(8002);
    }
  });

  it.only('should make at least 8000 matches', async () => {
    const measures: Measure[] = [
      { measuredAt: new Date(), value: 4.3, userId: 'a' },
      { measuredAt: new Date(), value: -4.3, userId: 'b' },
      { measuredAt: new Date(), value: 1, userId: 'c' },
      { measuredAt: new Date(), value: 2.3, userId: 'd' },
      { measuredAt: new Date(), value: 3, userId: 'e' },
      { measuredAt: new Date(), value: -5, userId: 'f' },
      { measuredAt: new Date(), value: -2, userId: 'g' },
    ];
    const prices: IPrice[] = [
      { buyPrice: 1.03, sellPrice: 1.04, _id: 'a' },
      { buyPrice: 1.04, sellPrice: 1.02, _id: 'b' },
      { buyPrice: 1.02, sellPrice: 1.01, _id: 'c' },
      { buyPrice: 1.03, sellPrice: 1.04, _id: 'd' },
      { buyPrice: 1.04, sellPrice: 1.05, _id: 'e' },
      { buyPrice: 1.05, sellPrice: 1.01, _id: 'f' },
      { buyPrice: 1.04, sellPrice: 1.0, _id: 'g' },
    ];
    const matches = await service.match(new LpfLafPolicy(), measures, prices);
    console.log(matches);
    expect(matches.length).toBeGreaterThanOrEqual(7);
  });
});
