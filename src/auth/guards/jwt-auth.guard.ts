import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractBearer } from '../../common/utils/auth-header.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractBearer(req);
    if (!token) throw new UnauthorizedException('Missing token');

    let payload: { sub: number; email: string; type: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.type !== 'user') throw new UnauthorizedException('Invalid token type');

    req.user = { id: payload.sub, email: payload.email };
    return true;
  }
}