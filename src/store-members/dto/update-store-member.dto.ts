import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreMemberDto } from './create-store-member.dto.js';

export class UpdateStoreMemberDto extends PartialType(CreateStoreMemberDto) {}
