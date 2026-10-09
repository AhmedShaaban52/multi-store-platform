import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { StoreMembersService } from './store-members.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { StoreAccess } from '../common/decorators/store-access/store-access.decorator.js';

@Controller('store-members')
@StoreAccess('owner', 'admin')
export class StoreMembersController {
  constructor(private readonly service: StoreMembersService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  add(@Body() dto: AddMemberDto) {
    return this.service.add(dto.email, dto.role);
  }

  @Patch(':id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberRoleDto) {
    return this.service.updateRole(id, dto.role);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}