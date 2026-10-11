import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from '../../../db/schema.js';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [user] = await this.db
      .select({ isSuperAdmin: users.isSuperAdmin, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, req.user.id));
    if (!user?.isSuperAdmin || !user.isActive) {
      throw new ForbiddenException('Super admin only');
    }
    return true;
  }
}