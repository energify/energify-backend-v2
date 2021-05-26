import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';

describe('PaymentsService', () => {
  let service: PaymentsService;

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
        MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
      ],
      providers: [PaymentsService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean the document', async () => {
    await service.deleteAll();
    const payments = await service.findAll();
    expect(payments).toHaveLength(0);
  });

  it('should store a payment with pending status (default)', async () => {
    const payment = await service.store({
      amount: 10,
      consumerId: 'abc',
      prosumerId: 'def',
      issuedAt: new Date(),
    });
    expect(payment.status).toBe(PaymentStatus.Pending);
  });

  it('should complete a payment', async () => {
    const payment = (await service.findAll())[0];
    expect(payment.status).toBe(PaymentStatus.Pending);
    await service.complete(payment.id, { hederaTransactionId: 'abcd' });
    const updatedPayment = await service.findById(payment.id);
    expect(updatedPayment.status).toBe(PaymentStatus.Completed);
    expect(updatedPayment.hederaTransactionId).toBe('abcd');
  });
});
