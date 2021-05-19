import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthedUser = createParamDecorator((_, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
