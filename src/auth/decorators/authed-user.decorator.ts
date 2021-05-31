import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export const AuthedUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user;
  return { ...user, id: Types.ObjectId.createFromHexString(user.id) };
});
