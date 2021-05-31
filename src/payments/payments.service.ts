import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { Readable } from 'stream';
import { IUser } from '../auth/interfaces/iuser.interface';
import { HederaService } from '../hedera/hedera.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { StorePaymentDto } from './dto/store-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { Payment } from './schemas/payment.schema';
import fetch from 'node-fetch';
import { addMinutes } from 'date-fns';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentsModel: Model<Payment>,
    private hederaService: HederaService,
    private transactionsService: TransactionsService,
    private usersService: UsersService,
  ) {}

  async store(dto: StorePaymentDto) {
    return this.paymentsModel.create(dto);
  }

  async storeBulk(dto: StorePaymentDto[]) {
    return this.paymentsModel.insertMany(dto);
  }

  async complete(id: Types.ObjectId, dto: CompletePaymentDto, authedUserId?: Types.ObjectId) {
    const payment = await this.findById(id);

    if (authedUserId && authedUserId !== payment.consumerId) {
      throw new UnauthorizedException();
    }

    const { hederaAccountId: fromAccountId } = await this.usersService.findHederaAccountIdById(
      payment.consumerId,
    );
    const { hederaAccountId: toAccountId } = await this.usersService.findHederaAccountIdById(
      payment.prosumerId,
    );

    if (
      await this.hederaService.didTransferOccur(
        fromAccountId,
        toAccountId,
        payment.amount,
        dto.hederaTransactionId,
        payment.issuedAt,
      )
    ) {
      payment.status = PaymentStatus.Completed;
      payment.hederaTransactionId = dto.hederaTransactionId;
      payment.paidAt = new Date();
      return payment.save();
    }

    throw new BadRequestException('Payment confirmation failed.');
  }

  async findAll() {
    return this.paymentsModel.find();
  }

  async deleteAll() {
    return this.paymentsModel.deleteMany();
  }

  async findById(id: Types.ObjectId) {
    return this.paymentsModel.findById(id);
  }

  async findByUserId(userId: Types.ObjectId) {
    return this.paymentsModel.find({ $or: [{ consumerId: userId }, { prosumerId: userId }] });
  }

  @Interval(500)
  async issue() {
    const oldest = await this.transactionsService.findOldestReadyForPayment();

    if (!oldest) return;

    const transactions = await this.transactionsService.findReadyForPayment(
      addMinutes(oldest.performedAt, 16),
    );
    const paymentsDto = new Array<StorePaymentDto>();

    for (const transaction of transactions) {
      const dto = paymentsDto.find(
        (p) => p.consumerId === transaction.consumerId && p.prosumerId === transaction.prosumerId,
      );

      if (dto) {
        dto.amount += transaction.pricePerKw * transaction.amount;
        dto.transactionIds.push(transaction._id);
      } else {
        paymentsDto.push({
          amount: transaction.pricePerKw * transaction.amount,
          consumerId: transaction.consumerId,
          prosumerId: transaction.prosumerId,
          transactionIds: [transaction._id],
          issuedAt: new Date(),
        });
      }

      transaction.isPaymentIssued = true;
      transaction.save();
    }

    await this.storeBulk(paymentsDto);
  }

  async generatePdfById(paymentId: Types.ObjectId, user: IUser) {
    const payment = await this.findById(paymentId);
    const consumer = await this.usersService.findById(payment.consumerId);
    const prosumer = await this.usersService.findById(payment.prosumerId);
    const quantity = await this.transactionsService.findAmountByIds(payment.transactionIds);

    /*if (user.id != consumer._id && user.id != prosumer._id) {
      throw new ForbiddenException('User do not have permission to visualize this invoice.');
    }*/

    const t = await fetch('https://invoice-generator.com', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        logo: 'https://energify.pt/logo-small.png',
        from: prosumer.name,
        to: consumer.name,
        number: payment._id,
        currency: 'EUR',
        date: null,
        items: [{ name: 'Energy Transfered', quantity, unit_cost: payment.amount }],
        fields: { tax: '%' },
        tax: 23,
      }),
    });
    const readable = new Readable();
    readable.push(await t.buffer());
    readable.push(null);
    return readable;
  }
}
