import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PLAN_LIMIT_KEY, type LimitedResource } from '../../utils/plans.js';
import { PlanLimitGuard } from '../../guards/plan-limit/plan-limit.guard.js';

export const PlanLimit = (resource: LimitedResource) =>
  applyDecorators(SetMetadata(PLAN_LIMIT_KEY, resource), UseGuards(PlanLimitGuard));