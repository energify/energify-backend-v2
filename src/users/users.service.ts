import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreUserDto } from './dto/store-user.dto';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { IPrice } from './interfaces/iprices.interface';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async store(dto: StoreUserDto) {
    return this.userModel.create(dto);
  }

  async findAll() {
    return this.userModel.find();
  }

  async findById(id: Types.ObjectId) {
    const user = await this.userModel.findById(id);
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findPricesById(id: Types.ObjectId) {
    return this.userModel.findOne({ _id: id }, { buyPrice: 1, sellPrice: 1 });
  }

  async findHederaAccountIdById(id: Types.ObjectId) {
    return this.userModel.findOne({ _id: id }, { hederaAccountId: 1 });
  }

  async findAllPrices() {
    return this.userModel.find({}, { buyPrice: 1, sellPrice: 1 });
  }

  async updatePricesById(id: Types.ObjectId, dto: UpdatePricesDto) {
    const { buyPrice, sellPrice } = dto;
    return this.userModel.updateOne({ _id: id }, { buyPrice, sellPrice });
  }

  async deleteAll() {
    return this.userModel.deleteMany();
  }
}
