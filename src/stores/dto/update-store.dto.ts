import { IsFQDN, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(80)
  name?: string;

  @IsOptional() @IsFQDN()
  customDomain?: string;

  @IsOptional() @IsObject()
  settings?: Record<string, unknown>;
}