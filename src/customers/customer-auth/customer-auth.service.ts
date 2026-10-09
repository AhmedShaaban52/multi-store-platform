import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { JwtService } from '@nestjs/jwt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import { TenantService } from '../../common/tenant/tenant.service.js';
import { CustomerRegisterDto } from '../dto/customer-register.dto.js';
import { customers } from '../../db/schema.js';
import { isUniqueViolation } from '../../common/utils/db-errors.js';
import { CustomerLoginDto } from '../dto/customer-login.dto.js';


const safeCustomer = { id: customers.id, email: customers.email, name: customers.name };

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly jwt: JwtService,
    private readonly tenant: TenantService,
  ) {}

  private sign(customerId: number, storeId: number) {
    return this.jwt.signAsync({ sub: customerId, storeId, type: 'customer' });
  }

  async register(dto: CustomerRegisterDto) {
    const storeId = this.tenant.getStoreId();
    const passwordHash = await argon2.hash(dto.password);
    try {
      const [customer] = await this.db
        .insert(customers)
        .values({ storeId, email: dto.email, name: dto.name, passwordHash })
        .returning(safeCustomer);
      return { customer, accessToken: await this.sign(customer.id, storeId) };
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Email already registered in this store');
      throw e;
    }
  }

  async login(dto: CustomerLoginDto) {
    const storeId = this.tenant.getStoreId();
    const [found] = await this.db
      .select()
      .from(customers)
      .where(and(eq(customers.storeId, storeId), eq(customers.email, dto.email)));
    if (!found || !(await argon2.verify(found.passwordHash, dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      customer: { id: found.id, email: found.email, name: found.name },
      accessToken: await this.sign(found.id, storeId),
    };
  }
}