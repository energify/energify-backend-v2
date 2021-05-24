import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MeasureDocument = Measure & Document;

@Schema()
export class Measure {
  _id: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true, index: true })
  measuredAt: Date;

  @Prop({ required: true, index: true })
  userId: string;
}

export const MeasureSchema = SchemaFactory.createForClass(Measure);
