import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug: lowercase letters, numbers and hyphens' })
  @MaxLength(80)
  slug!: string;

  @IsString() @IsNotEmpty() @MaxLength(150)
  name!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsInt() @Min(0)
  price!: number;

  @IsOptional() @IsInt() @Min(0)
  stock?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}