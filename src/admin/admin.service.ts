import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { desc, eq } from 'drizzle-orm';
import { stores } from '../db/schema.js';

@Injectable()
export class AdminService {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  listStores() {
    return this.db
      .select({
        id: stores.id,
        name: stores.name,
        slug: stores.slug,
        customDomain: stores.customDomain,
        plan: stores.plan,
        createdAt: stores.createdAt,
      })
      .from(stores)
      .orderBy(desc(stores.id));
  }

  async updatePlan(id: number, plan: string) {
    const [store] = await this.db
      .update(stores)
      .set({ plan })
      .where(eq(stores.id, id))
      .returning();
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }
}