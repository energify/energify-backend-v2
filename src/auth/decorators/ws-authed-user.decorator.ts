import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';
import { Socket } from 'socket.io';

export const WsAuthedUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const user = (ctx.switchToWs().getClient<Socket>().handshake as any).user;
  return { ...user, id: Types.ObjectId.createFromHexString(user.id) };
});
