import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { StoreAccess } from '../common/decorators/store-access/store-access.decorator.js';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateStoreDto) {
    return this.storesService.create(req.user.id, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(@Req() req: any) {
    return this.storesService.mine(req.user.id);
  }

  @Get('by-slug/:slug')
  async bySlug(@Param('slug') slug: string) {
    const store = await this.storesService.findBySlug(slug);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  @Get('current')
  @StoreAccess()
  current() {
    return this.storesService.current();
  }

  @Patch('current')
  @StoreAccess('owner', 'admin')
  update(@Body() dto: UpdateStoreDto) {
    return this.storesService.updateCurrent(dto);
  }
}