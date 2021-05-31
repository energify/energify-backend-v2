import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ toObject: { virtuals: true, versionKey: false } })
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  pricePerKw: number;

  @Prop({ required: true, default: false })
  isPaymentIssued: boolean;

  @Prop({ type: Types.ObjectId })
  consumerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  prosumerId?: Types.ObjectId;

  @Prop({ required: true })
  performedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
