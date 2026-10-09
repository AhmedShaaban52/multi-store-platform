import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantService } from '../../tenant/tenant.service.js';
import { extractBearer } from '../../utils/auth-header.js';

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly tenant: TenantService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractBearer(req);
    if (!token) throw new UnauthorizedException('Missing token');

    let payload: { sub: number; storeId: number; type: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.type !== 'customer' || payload.storeId !== this.tenant.getStoreId()) {
      throw new UnauthorizedException('Invalid token for this store');
    }
    req.customer = { id: payload.sub, storeId: payload.storeId };
    return true;
  }
}