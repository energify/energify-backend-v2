import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MeasuresService } from './measures.service';
import { Measure, MeasureSchema } from './schemas/measure.schema';
import { performance } from 'perf_hooks';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StoreMeasureDto } from './dto/store-measure.dto';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';

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
        TransactionsModule,
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
    const userId = Math.random() < 0.5 ? '60ae6bfc4845b314803c8945' : '60ae6c0a084a66146a02a16c';
    let measure = await service.store(userId, {
      value: 1,
      timestamp: new Date('12-22-2020').getTime() / 1000,
    });
    expect(measure.value).toBe(1);
    measure = await service.store(userId, {
      value: 2,
      timestamp: new Date('12-23-2020').getTime() / 1000,
    });
    expect(measure.value).toBe(2);
  });

  it('should find 2 measures between 21-12-2020 and 24-12-2020', async () => {
    const measures = await service.findByDateInterval(
      new Date('12-21-2020'),
      new Date('12-24-2020'),
    );

    expect(measures).toHaveLength(2);
  });

  it('should store 8000 measures under 1 second', async () => {
    const measures = new Array<StoreMeasureDto>();
    const userId = Math.random() < 0.5 ? '60ae6bfc4845b314803c8945' : '60ae6c0a084a66146a02a16c';

    for (let i = 0; i < 8000; i++) {
      measures.push({
        value: Math.random() < 0.5 ? Math.random() * -10 : Math.random(),
        timestamp: Date.now() / 1000,
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
});
