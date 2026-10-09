import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { customers } from '../db/schema.js';
import { TenantService } from '../common/tenant/tenant.service.js';

const safeCustomer = { id: customers.id, email: customers.email, name: customers.name };

@Injectable()
export class CustomersService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
  ) {}

  async findOne(id: number) {
    const [customer] = await this.db
      .select(safeCustomer)
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.storeId, this.tenant.getStoreId())));
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  list() {
    return this.db.select(safeCustomer).from(customers).where(eq(customers.storeId, this.tenant.getStoreId()));
  }
}