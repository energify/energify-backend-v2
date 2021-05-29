import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeasureDocument = Measure & Document;

@Schema({ toObject: { virtuals: true, versionKey: false } })
export class Measure {
  id?: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, index: true })
  measuredAt: Date;

  @Prop({ required: true, index: true })
  userId: Types.ObjectId;
}

export const MeasureSchema = SchemaFactory.createForClass(Measure);
