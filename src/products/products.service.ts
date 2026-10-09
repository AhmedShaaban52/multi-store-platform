import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { products } from '../db/schema.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { TenantService } from '../common/tenant/tenant.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
  ) {}

  listPublic() {
    return this.db
      .select()
      .from(products)
      .where(and(eq(products.storeId, this.tenant.getStoreId()), eq(products.isActive, true)));
  }

  listAll() {
    return this.db.select().from(products).where(eq(products.storeId, this.tenant.getStoreId()));
  }

  async findBySlug(slug: string) {
    const [product] = await this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, this.tenant.getStoreId()),
          eq(products.slug, slug),
          eq(products.isActive, true),
        ),
      );
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    try {
      const [product] = await this.db
        .insert(products)
        .values({ ...dto, storeId: this.tenant.getStoreId() })
        .returning();
      return product;
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('Product slug already used in this store');
      throw e;
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    const [product] = await this.db
      .update(products)
      .set(dto)
      .where(and(eq(products.id, id), eq(products.storeId, this.tenant.getStoreId())))
      .returning();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: number) {
    try {
      const [product] = await this.db
        .delete(products)
        .where(and(eq(products.id, id), eq(products.storeId, this.tenant.getStoreId())))
        .returning({ id: products.id });
      if (!product) throw new NotFoundException('Product not found');
      return { deleted: true };
    } catch (e: any) {
      if (e?.code === '23503' || e?.cause?.code === '23503') {
        throw new ConflictException('Product has orders. Deactivate it (isActive=false) instead');
      }
      throw e;
    }
  }
}