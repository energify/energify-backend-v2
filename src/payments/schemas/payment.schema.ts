import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../enums/payment-status.enum';

export type PaymentDocument = Payment & Document;

@Schema({ toObject: { virtuals: true, versionKey: false } })
export class Payment {
  id: string;

  @Prop()
  hederaTransactionHash: string;

  @Prop({ required: true })
  consumerId: Types.ObjectId;

  @Prop({ required: true })
  prosumerId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, default: PaymentStatus.Pending })
  status: PaymentStatus;

  @Prop({ required: true, index: true })
  issuedAt: Date;

  @Prop({ required: true })
  transactionIds: Types.ObjectId[];

  @Prop()
  paidAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
