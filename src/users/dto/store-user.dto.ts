import { IsEmail, IsString } from 'class-validator';

export class StoreUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  hederaAccountId: string;
}
