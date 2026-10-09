import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { storeMembers } from '../../../db/schema.js';
import { TenantService } from '../../tenant/tenant.service.js';

@Injectable()
export class StoreMemberGuard implements CanActivate {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const [member] = await this.db
      .select({ role: storeMembers.role })
      .from(storeMembers)
      .where(
        and(
          eq(storeMembers.storeId, this.tenant.getStoreId()),
          eq(storeMembers.userId, req.user.id),
        ),
      );
    if (!member) throw new ForbiddenException('You are not a member of this store');
    req.membership = member;
    return true;
  }
}