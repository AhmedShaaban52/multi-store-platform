import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { CustomerAuthGuard } from '../common/guards/customer-auth/customer-auth.guard.js';
import { StoreAccess } from '../common/decorators/store-access/store-access.decorator.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(CustomerAuthGuard)
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.customer.id, dto);
  }

  @Get('my')
  @UseGuards(CustomerAuthGuard)
  my(@Req() req: any) {
    return this.ordersService.myOrders(req.customer.id);
  }

  @Get()
  @StoreAccess()
  listAll(@Query('status') status?: UpdateOrderStatusDto['status']) {
    return this.ordersService.listAll(status);
  }

  @Patch(':id/status')
  @StoreAccess()
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}