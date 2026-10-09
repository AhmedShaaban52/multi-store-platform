import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Reflector } from '@nestjs/core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { count, eq } from 'drizzle-orm';
import { products } from '../../../db/schema.js';
import { TenantService } from '../../tenant/tenant.service.js';
import { PLAN_LIMIT_KEY, PLAN_LIMITS, type LimitedResource } from '../../utils/plans.js';

@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<LimitedResource>(PLAN_LIMIT_KEY, context.getHandler());
    if (!resource) return true;

    const store = this.tenant.getStore();
    const limit = (PLAN_LIMITS[store.plan] ?? PLAN_LIMITS.free)[resource];

    let used = 0;
    if (resource === 'products') {
      const [row] = await this.db
        .select({ value: count() })
        .from(products)
        .where(eq(products.storeId, store.id));
      used = row.value;
    }
    if (used >= limit) {
      throw new ForbiddenException(`Plan "${store.plan}" allows up to ${limit} ${resource}`);
    }
    return true;
  }
}