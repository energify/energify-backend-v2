import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findPricesById(id: string) {
    return this.userModel.findOne({ id }, { buyPrice: 1, sellPrice: 1 });
  }

  async findHederaAccountIdById(id: string) {
    return this.userModel.findOne({ id }, { hederaAccountId: 1 });
  }

  async findAllPrices() {
    return this.userModel.find({}, { buyPrice: 1, sellPrice: 1 });
  }

  async updatePricesById(id: string, dto: UpdatePricesDto) {
    const { buyPrice, sellPrice } = dto;
    return this.userModel.updateOne({ id }, { buyPrice, sellPrice });
  }

  async deleteAll() {
    return this.userModel.deleteMany();
  }
}
