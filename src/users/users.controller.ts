import { Body, Controller, Put } from '@nestjs/common';
import { AuthedUser } from '../auth/decorators/authed-user.decorator';
import { IUser } from '../auth/interfaces/iuser.interface';
import { UpdatePricesDto } from './dto/update-prices.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('prices')
  async updatePricesById(@AuthedUser() user: IUser, @Body() dto: UpdatePricesDto) {
    return this.usersService.updatePricesById(user.id, dto);
  }
}
