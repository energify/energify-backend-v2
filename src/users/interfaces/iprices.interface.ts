import { Types } from 'mongoose';

export interface IPrice {
  _id?: Types.ObjectId;
  buyPrice: number;
  sellPrice: number;
}
