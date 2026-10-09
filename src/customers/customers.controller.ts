import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomerAuthService } from './customer-auth/customer-auth.service.js';
import { CustomerRegisterDto } from './dto/customer-register.dto.js';
import { CustomerLoginDto } from './dto/customer-login.dto.js';
import { CustomerAuthGuard } from '../common/guards/customer-auth/customer-auth.guard.js';
import { StoreAccess } from '../common/decorators/store-access/store-access.decorator.js';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly customerAuth: CustomerAuthService,
  ) {}

  @Post('register')
  register(@Body() dto: CustomerRegisterDto) {
    return this.customerAuth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: CustomerLoginDto) {
    return this.customerAuth.login(dto);
  }

  @Get('me')
  @UseGuards(CustomerAuthGuard)
  me(@Req() req: any) {
    return this.customersService.findOne(req.customer.id);
  }

  @Get()
  @StoreAccess('owner', 'admin')
  list() {
    return this.customersService.list();
  }
}