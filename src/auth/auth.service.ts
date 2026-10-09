import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private sign(user: { id: number; email: string }) {
    return this.jwt.signAsync({ sub: user.id, email: user.email, type: 'user' });
  }

  async register(dto: RegisterDto) {
    const { password, ...rest } = dto;
    const passwordHash = await argon2.hash(password);
    try {
      const user = await this.users.create({ ...rest, passwordHash });
      return { user, accessToken: await this.sign(user) };
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Email already registered');
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const found = await this.users.findByEmail(dto.email);
    const ok = found?.isActive && (await argon2.verify(found.passwordHash, dto.password));
    if (!found || !ok) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash, ...user } = found;
    return { user, accessToken: await this.sign(user) };
  }

  me(userId: number) {
    return this.users.findOne(userId);
  }
}