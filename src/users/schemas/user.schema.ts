import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ toObject: { virtuals: true, versionKey: false } })
export class User {
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  birthdate?: Date;

  @Prop()
  cc?: string;

  @Prop()
  nif?: string;

  @Prop({ required: true })
  hederaAccountId: string;

  @Prop({ default: 0.2 })
  buyPrice: number;

  @Prop({ default: 0.2 })
  sellPrice: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
