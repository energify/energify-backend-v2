import { Body, Controller, Get, Param, Put, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthedUser } from '../auth/decorators/authed-user.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async findAuthed(@AuthedUser() user: IUser) {
    const _user = await this.usersService.findById(user.id);
    if (!_user) throw new UnauthorizedException('Invalid credentials');
    return _user;
  }

  @Get(':id/hederaAccountId')
  async findHederaAccountIdById(@Param('id') id: Types.ObjectId) {
    return this.usersService.findHederaAccountIdById(id);
  }

  @Put('prices')
  async updatePricesById(@AuthedUser() user: IUser, @Body() dto: UpdatePricesDto) {
    return this.usersService.updatePricesById(user.id, dto);
  }
}
