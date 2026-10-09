import { IsIn } from 'class-validator';
import type { MemberRole } from '../../db/schema.js';

export class UpdateMemberRoleDto {
  @IsIn(['admin', 'staff'])
  role!: Exclude<MemberRole, 'owner'>;
}