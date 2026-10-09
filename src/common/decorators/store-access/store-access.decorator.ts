import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard.js';
import { StoreMemberGuard } from '../../guards/store-member/store-member.guard.js';
import { RolesGuard } from '../../guards/roles/roles.guard.js';
import { Roles } from '../roles/roles.decorator.js';
import type { MemberRole } from '../../../db/schema.js';


export const StoreAccess = (...roles: MemberRole[]) =>
  applyDecorators(UseGuards(JwtAuthGuard, StoreMemberGuard, RolesGuard), Roles(...roles));