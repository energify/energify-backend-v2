import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  pricePerKw: number;

  @Prop({ required: true })
  consumerId: string;

  @Prop({ required: true })
  prosumerId: string;

  @Prop({ required: true })
  performedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
