import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Measure, MeasureSchema } from './schemas/measure.schema';
import { MeasuresService } from './measures.service';
import { MeasuresGateway } from './measures.gateway';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Measure.name, schema: MeasureSchema }]),
    UsersModule,
  ],
  providers: [MeasuresService, MeasuresGateway],
})
export class MeasuresModule {}
