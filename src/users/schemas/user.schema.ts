import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 1.2 })
  buyPrice: number;

  @Prop({ default: 1.2 })
  sellPrice: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
