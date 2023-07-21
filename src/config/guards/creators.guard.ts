import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithUser } from 'src/types/services';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

@Injectable()
export class CreatorsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest() as
      | RequestWithUser
      | undefined;

    return !!user && user.isCreator;
  }
}
