import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hash, compare } from 'bcrypt';
import { decode, sign, verify } from 'jsonwebtoken';
import { User } from '../users/schemas/user.schema';
import { IUser } from './interfaces/iuser.interface';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findOneByEmail(dto.email);

    if (!user || !(await compare(dto.password, user.password))) {
      throw new BadRequestException('Provided credentials are not correct.');
    }

    return sign({ ...this.payload(user) }, 'test');
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.findOneByEmail(dto.email);

    if (user) {
      throw new BadRequestException('Email is already in use.');
    }

    const hashedPassword = await hash(dto.password, 10);
    return this.usersService.store({ ...dto, password: hashedPassword });
  }

  verify(token: string) {
    try {
      return !!verify(token, 'test');
    } catch (e) {
      return false;
    }
  }

  decode(token: string) {
    return decode(token);
  }

  private async payload(user: User) {
    return { name: user.name, email: user.email };
  }
}
