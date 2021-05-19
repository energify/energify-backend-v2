import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Measure, MeasureSchema } from '../measures/schemas/measure.schema';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

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
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register user', async () => {
    const user = await service.register({ email: 'test@test.com', name: 'Vasco', password: '123' });
    expect(user.name).toBe('Vasco');
    expect(user.password !== '123').toBeTruthy();
  });

  it('should not register user with existing email', async () => {
    expect(
      service.register({ email: 'test@test.com', name: 'Vasco', password: '123' }),
    ).rejects.toThrowError('Email is already in use.');
  });

  it('should fail login', async () => {
    expect(service.login({ email: 'test@test.com', password: '1234' })).rejects.toThrowError(
      'Provided credentials are not correct.',
    );
  });

  it('should login and verify', async () => {
    const token = await service.login({ email: 'test@test.com', password: '123' });
    expect(await service.verify(token)).toBeTruthy();
  });
});
