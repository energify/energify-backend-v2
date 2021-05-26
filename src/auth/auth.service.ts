import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hash, compare } from 'bcrypt';
import { decode, sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await compare(dto.password, user.password))) {
      throw new BadRequestException('Provided credentials are not correct.');
    }

    return { accessToken: sign({ id: user.id, email: user.email, name: user.name }, 'test') };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.findByEmail(dto.email);

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
}
