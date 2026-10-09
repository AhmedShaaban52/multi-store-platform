import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { CustomerAuthService } from './customer-auth/customer-auth.service.js';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, CustomerAuthService],
})
export class CustomersModule {}
