import { BadRequestException, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import type { Store } from '../../db/schema.js';

@Injectable()
export class TenantService {
  constructor(private readonly cls: ClsService) {}

  getStore(): Store {
    const store = this.cls.get('store') as Store | undefined;
    if (!store) throw new BadRequestException('Store not resolved for this request');
    return store;
  }

  getStoreId(): number {
    return this.getStore().id;
  }
}