import { Transform } from 'class-transformer';
import { IsEmail, IsIn } from 'class-validator';
import type { MemberRole } from '../../db/schema.js';

export class AddMemberDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsIn(['admin', 'staff'])
  role!: Exclude<MemberRole, 'owner'>;
}