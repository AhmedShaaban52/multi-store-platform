import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString() @MinLength(8) @MaxLength(72)
  password!: string;

  @IsString() @IsNotEmpty()
  firstName!: string;

  @IsString() @IsNotEmpty()
  lastName!: string;
}