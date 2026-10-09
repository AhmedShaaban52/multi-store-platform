import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { StoreAccess } from '../common/decorators/store-access/store-access.decorator.js';
import { PlanLimit } from '../common/decorators/plan-limit/plan-limit.decorator.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listPublic() {
    return this.productsService.listPublic();
  }

  @Get('admin')
  @StoreAccess()
  listAll() {
    return this.productsService.listAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }


  @Post()
  @PlanLimit('products')
  @StoreAccess('owner', 'admin')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @StoreAccess('owner', 'admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @StoreAccess('owner', 'admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}