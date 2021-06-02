import { Controller, Get, Query } from '@nestjs/common';
import { AuthedUser } from '../auth/decorators/authed-user.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { TimeInterval } from '../common/types';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('amounts/history')
  async findAuthedUserAmountsHistory(
    @AuthedUser() user: IUser,
    @Query('end') end: Date,
    @Query('interval') interval: TimeInterval,
  ) {
    return this.transactionsService.findAmountsHistoryByUserId(user.id, end, interval);
  }

  @Get('amounts/flow')
  async findAuthedUserAmountsFlow(
    @AuthedUser() user: IUser,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.transactionsService.findAmountsFlowByUserId(user.id, start, end);
  }

  @Get('price/history')
  async findPriceHistory(@Query('end') end: Date, @Query('interval') interval: TimeInterval) {
    return this.transactionsService.findPriceHistory(end, interval);
  }
}
