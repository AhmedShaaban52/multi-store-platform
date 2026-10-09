import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, gte, inArray, max, sql } from 'drizzle-orm';
import { orderItems, orders, orderStatus, products, stores } from '../db/schema.js';
import { TenantService } from '../common/tenant/tenant.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
  ) {}

  async create(customerId: number, dto: CreateOrderDto) {
    const storeId = this.tenant.getStoreId();

    const wanted = new Map<number, number>();
    for (const i of dto.items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);

    return this.db.transaction(async (tx) => {
      await tx.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).for('update');
      const [last] = await tx
        .select({ n: max(orders.orderNumber) })
        .from(orders)
        .where(eq(orders.storeId, storeId));
      const orderNumber = (last?.n ?? 1000) + 1;

      const lines: { productId: number; quantity: number; unitPrice: number }[] = [];
      let total = 0;
      for (const [productId, quantity] of wanted) {
        const [p] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${quantity}` })
          .where(
            and(
              eq(products.id, productId),
              eq(products.storeId, storeId),
              eq(products.isActive, true),
              gte(products.stock, quantity),
            ),
          )
          .returning({ price: products.price });
        if (!p) throw new BadRequestException(`Product ${productId} is unavailable or out of stock`);
        lines.push({ productId, quantity, unitPrice: p.price });
        total += p.price * quantity;
      }

      const [order] = await tx
        .insert(orders)
        .values({ storeId, customerId, orderNumber, total })
        .returning();
      await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
      return { ...order, items: lines };
    });
  }

  private async withItems(rows: (typeof orders.$inferSelect)[]) {
    if (!rows.length) return [];
    const items = await this.db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, rows.map((o) => o.id)));
    return rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) }));
  }

  async myOrders(customerId: number) {
    const rows = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.storeId, this.tenant.getStoreId()), eq(orders.customerId, customerId)))
      .orderBy(desc(orders.id));
    return this.withItems(rows);
  }

  async listAll(status?: UpdateOrderStatusDto['status']) {
    if (status && !orderStatus.enumValues.includes(status)) {
      throw new BadRequestException(`status must be one of: ${orderStatus.enumValues.join(', ')}`);
    }
    const storeId = this.tenant.getStoreId();
    const rows = await this.db
      .select()
      .from(orders)
      .where(status ? and(eq(orders.storeId, storeId), eq(orders.status, status)) : eq(orders.storeId, storeId))
      .orderBy(desc(orders.id));
    return this.withItems(rows);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const storeId = this.tenant.getStoreId();
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, id), eq(orders.storeId, storeId)))
        .for('update');
      if (!order) throw new NotFoundException('Order not found');
      if (order.status === 'cancelled') throw new BadRequestException('Order is already cancelled');


      if (dto.status === 'cancelled') {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
        for (const i of items) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${i.quantity}` })
            .where(eq(products.id, i.productId));
        }
      }
      const [updated] = await tx.update(orders).set({ status: dto.status }).where(eq(orders.id, id)).returning();
      return updated;
    });
  }
}