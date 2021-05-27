import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { performance } from 'perf_hooks';
import { StoreTransactionDto } from './dto/store-transaction.dto';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionsService } from './transactions.service';
import { subHours } from 'date-fns';
import { Types } from 'mongoose';

describe('TransactionsService', () => {
  let service: TransactionsService;

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
        MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
      ],
      providers: [TransactionsService],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean the document', async () => {
    await service.deleteAll();
    const transactions = await service.findAll();
    expect(transactions).toHaveLength(0);
  });

  it('should store 1 transaction', async () => {
    const transaction = await service.store({
      amount: 10,
      consumerId: Types.ObjectId('60ae6bfc4845b314803c8945'),
      prosumerId: Types.ObjectId('60ae6c0a084a66146a02a16c'),
      performedAt: new Date(),
      pricePerKw: 1.1,
    });
    expect(transaction.amount).toBe(10);
  });

  it('should store 8000 transaction under 4 second', async () => {
    const transactions = new Array<StoreTransactionDto>();

    for (let i = 0; i < 8000; i++) {
      transactions.push({
        amount: Math.random() < 0.5 ? Math.random() * -10 : Math.random() * 10,
        consumerId: Types.ObjectId(
          Math.random() < 0.5 ? '60ae6bfc4845b314803c8945' : '60ae6c0a084a66146a02a16c',
        ),
        prosumerId: Types.ObjectId(
          Math.random() < 0.5 ? '60ae6bfc4845b314803c8945' : '60ae6c0a084a66146a02a16c',
        ),
        performedAt: new Date(Math.random() < 0.5 ? '12-22-2020' : '12-23-2020'),
        pricePerKw: 1.1,
      });
    }

    const t1 = performance.now();
    await service.storeBulk(transactions);
    const t2 = performance.now();
    expect(t2 - t1).toBeLessThan(4000);
  });

  it('should find avg price by date interval', async () => {
    const price = await service.findPriceByDateInterval(subHours(new Date(), 12), new Date());
    expect(price).toBe(1.1);
  });

  it('should find amounts by user and date interval', async () => {
    const { consumed, produced } = await service.findAmountsByUserId(
      Types.ObjectId('60ae6bfc4845b314803c8945'),
      subHours(new Date('12-22-2020'), 12),
      new Date('12-22-2020'),
    );

    expect(consumed === 0).toBeFalsy();
    expect(produced === 0).toBeFalsy();
  });

  it('should find price history for time interval = 1d', async () => {
    const priceHistory = await service.findPriceHistory(new Date('12-24-2020'), '1d');
  });
});
