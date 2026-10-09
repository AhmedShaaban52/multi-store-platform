import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { storeMembers, stores } from '../db/schema.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { TenantService } from '../common/tenant/tenant.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';

@Injectable()
export class StoresService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
  ) {}

  async create(userId: number, dto: CreateStoreDto) {
    try {
      return await this.db.transaction(async (tx) => {
        const [store] = await tx.insert(stores).values(dto).returning();
        await tx.insert(storeMembers).values({ storeId: store.id, userId, role: 'owner' });
        return store;
      });
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Store slug or domain already taken');
      throw e;
    }
  }

  mine(userId: number) {
    return this.db
      .select({ id: stores.id, name: stores.name, slug: stores.slug, plan: stores.plan, role: storeMembers.role })
      .from(storeMembers)
      .innerJoin(stores, eq(stores.id, storeMembers.storeId))
      .where(eq(storeMembers.userId, userId));
  }

  async findBySlug(slug: string) {
    const [store] = await this.db
      .select({ id: stores.id, name: stores.name, slug: stores.slug })
      .from(stores)
      .where(eq(stores.slug, slug.toLowerCase()));
    return store ?? null;
  }

  current() {
    return this.tenant.getStore();
  }

  async updateCurrent(dto: UpdateStoreDto) {
    try {
      const [store] = await this.db
        .update(stores)
        .set(dto)
        .where(eq(stores.id, this.tenant.getStoreId()))
        .returning();
      return store;
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Domain already taken');
      throw e;
    }
  }
}