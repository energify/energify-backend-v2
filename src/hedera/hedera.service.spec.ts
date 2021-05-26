import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HederaService } from './hedera.service';

describe('HederaService', () => {
  let service: HederaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [HederaService],
    }).compile();

    service = module.get<HederaService>(HederaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch 0.0.539171 transfers', async () => {
    const transfers = await service.fetchAccountTransfers('0.0.539171');
    expect(transfers.length).toBeGreaterThan(0);
  });

  it('should confirm transfer', () => {
    expect(
      service.didTransferOccur(
        '0.0.539171',
        '0.0.539172',
        1000000000,
        '0.0.460923-1619180491-247405115',
        new Date('12-22-2020'),
      ),
    ).resolves.toBeTruthy();
  });

  it('should not confirm transfer because wrong transactionId', () => {
    expect(
      service.didTransferOccur(
        '0.0.539171',
        '0.0.539172',
        1000000000,
        '0.0.460923-1619180491-247405114',
        new Date('12-22-2020'),
      ),
    ).resolves.toBeFalsy();
  });

  it('should not confirm transfer because wrong amount', () => {
    expect(
      service.didTransferOccur(
        '0.0.539171',
        '0.0.539172',
        5000000000,
        '0.0.460923-1619180491-247405114',
        new Date('12-22-2020'),
      ),
    ).resolves.toBeFalsy();
  });

  it('should not confirm transfer because consensus before payment issue', () => {
    expect(
      service.didTransferOccur(
        '0.0.539171',
        '0.0.539172',
        5000000000,
        '0.0.460923-1619180491-247405114',
        new Date(),
      ),
    ).resolves.toBeFalsy();
  });
});
