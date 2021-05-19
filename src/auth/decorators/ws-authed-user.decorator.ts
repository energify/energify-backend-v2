import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const WsAuthedUser = createParamDecorator((_, ctx: ExecutionContext) => {
  return (ctx.switchToWs().getClient<Socket>().handshake as any).user;
});
