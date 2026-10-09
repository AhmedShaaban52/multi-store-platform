import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { ClsService } from 'nestjs-cls';
import { stores } from '../../../db/schema.js';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly cls: ClsService,
  ) {}

  async use(req: any, _res: any, next: (err?: any) => void) {
    const store = await this.resolve(req);
    if (!store) throw new NotFoundException('Store not found');
    this.cls.run(() => {
      this.cls.set('store', store);
      next();
    });
  }

  private async resolve(req: any) {
    const header = req.headers['x-store-slug'];
    if (typeof header === 'string' && header.trim()) {
      return this.bySlug(header.trim().toLowerCase());
    }
    const host = String(req.headers.host ?? '').split(':')[0].toLowerCase();
    const platform = process.env.PLATFORM_DOMAIN?.toLowerCase();
    if (platform && host.endsWith(`.${platform}`)) {
      return this.bySlug(host.slice(0, -(platform.length + 1)));
    }
    if (host) {
      const [store] = await this.db.select().from(stores).where(eq(stores.customDomain, host));
      return store ?? null;
    }
    return null;
  }

  private async bySlug(slug: string) {
    const [store] = await this.db.select().from(stores).where(eq(stores.slug, slug));
    return store ?? null;
  }
}