import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HederaService } from './hedera.service';

@Module({
  imports: [ConfigModule],
  providers: [HederaService],
  exports: [HederaService],
})
export class HederaModule {}
