import { Module } from '@nestjs/common';
import { StoreMembersService } from './store-members.service.js';
import { StoreMembersController } from './store-members.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [StoreMembersController],
  providers: [StoreMembersService],
})
export class StoreMembersModule {}