import { IsIn } from 'class-validator';
import type { orderStatus } from '../../db/schema.js';

export class UpdateOrderStatusDto {
  @IsIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
  status!: (typeof orderStatus.enumValues)[number];
}