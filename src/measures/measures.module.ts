import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Measure, MeasureSchema } from './schemas/measure.schema';
import { MeasuresService } from './measures.service';
import { MeasuresGateway } from './measures.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Measure.name, schema: MeasureSchema }]),
    AuthModule,
    UsersModule,
    TransactionsModule,
  ],
  providers: [MeasuresService, MeasuresGateway],
})
export class MeasuresModule {}
