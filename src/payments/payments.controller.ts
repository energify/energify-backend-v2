import { Body, Controller, Get, Param, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthedUser } from '../auth/decorators/authed-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { ParseObjectIdPipe } from '../common/pipes/parse-objectid.pipe';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get(':paymentId')
  @Public() //TODO
  async generatePdf(
    @Res() res: Response,
    @Param('paymentId', ParseObjectIdPipe) paymentId: Types.ObjectId,
    @AuthedUser() user: IUser,
  ) {
    const stream = await this.paymentsService.generatePdfById(paymentId, user);
    return stream.pipe(res);
  }

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
