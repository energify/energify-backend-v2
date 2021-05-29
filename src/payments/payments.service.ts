import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Interval } from '@nestjs/schedule';
import { Model, Types } from 'mongoose';
import { HederaService } from '../hedera/hedera.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UsersService } from '../users/users.service';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { StorePaymentDto } from './dto/store-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { Payment } from './schemas/payment.schema';

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

    if (authedUserId && authedUserId !== payment.id) {
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

  @Interval(5000)
  async issue() {
    const transactions = await this.transactionsService.findReadyForPayment();
    const paymentsDto = new Array<StorePaymentDto>();

    for (const transaction of transactions) {
      const dto = paymentsDto.find(
        (p) => p.consumerId === transaction.consumerId && p.prosumerId === transaction.prosumerId,
      );

      if (dto) {
        dto.amount += transaction.pricePerKw * transaction.amount;
        dto.transactionIds.push(transaction.id);
      } else {
        paymentsDto.push({
          amount: transaction.pricePerKw * transaction.amount,
          consumerId: transaction.consumerId,
          prosumerId: transaction.prosumerId,
          transactionIds: [transaction.id],
          issuedAt: new Date(),
        });
      }
    }

    await this.storeBulk(paymentsDto);
  }
}
