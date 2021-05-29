import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthedUser } from '../auth/decorators/authed-user.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get('me')
  async findByAuthedUser(@AuthedUser() user: IUser) {
    return this.paymentsService.findByUserId(user.id);
  }

  @Put(':id')
  async complete(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() dto: CompletePaymentDto,
    @AuthedUser() user: IUser,
  ) {
    return this.paymentsService.complete(id, dto, user.id);
  }
}
