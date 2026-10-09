import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/roles/roles.decorator.js';
import type { MemberRole } from '../../../db/schema.js';


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<MemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const role = context.switchToHttp().getRequest().membership?.role as MemberRole | undefined;
    if (!role || !roles.includes(role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}