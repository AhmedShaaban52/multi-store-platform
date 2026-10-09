import { Transform } from 'class-transformer';
import { IsFQDN, IsNotEmpty, IsNotIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const RESERVED_SLUGS = ['www', 'api', 'app', 'admin', 'dashboard', 'stores'];

export class CreateStoreDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  name!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/, {
    message: 'slug must be 3-40 chars: lowercase letters, numbers and hyphens',
  })
  @IsNotIn(RESERVED_SLUGS)
  slug!: string;

  @IsOptional() @IsFQDN()
  customDomain?: string;
}