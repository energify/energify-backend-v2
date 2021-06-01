import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { IS_PUBLIC } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as Request;
    const token = request.header('authorization')?.replace('Bearer ', '');
    const isPublic = this.reflector.getAll<boolean[]>(IS_PUBLIC, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (isPublic.includes(true)) {
      return true;
    } else if (token && this.authService.verify(token)) {
      (request as any).user = this.authService.decode(token);
      return true;
    }

    return false;
  }
}
