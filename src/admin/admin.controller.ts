import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { UpdatePlanDto } from './dto/update-plan.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SuperAdminGuard } from '../common/guards/super-admin/super-admin.guard.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stores')
  listStores() {
    return this.adminService.listStores();
  }

  @Patch('stores/:id/plan')
  updatePlan(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.adminService.updatePlan(id, dto.plan);
  }
}