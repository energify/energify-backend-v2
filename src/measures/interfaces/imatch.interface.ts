import { Types } from 'mongoose';

export interface IMatch {
  value: number;
  pricePerKw: number;
  consumerId: Types.ObjectId;
  prosumerId: Types.ObjectId;
  matchedAt: Date;
}
