import { Types } from 'mongoose';

export interface IUser {
  id: Types.ObjectId;
  email: string;
  name: string;
}
