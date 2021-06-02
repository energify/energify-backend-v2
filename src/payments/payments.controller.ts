import { Body, Controller, Get, Param, Put, Res, Query, ParseIntPipe } from '@nestjs/common';
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

  @Get(':id/invoice')
  @Public() //TODO
  async generatePdf(
    @Res() res: Response,
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @AuthedUser() user: IUser,
  ) {
    const stream = await this.paymentsService.generatePdfById(id, user);
    return stream.pipe(res);
  }

  @Get()
  async findByAuthedUser(
    @AuthedUser() user: IUser,
    @Query('page') page: number = 1,
    @Query('type') type: string = 'all',
    @Query('min-price') minPrice: number = 0,
    @Query('max-price') maxPrice: number = Number.MAX_SAFE_INTEGER,
    @Query('date') date?: Date,
  ) {
    return this.paymentsService.findByUserId(user.id, page, type, minPrice, maxPrice, date);
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
