import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { StoresModule } from './stores/stores.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StoreMembersModule } from './store-members/store-members.module.js';
import { ProductsModule } from './products/products.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { TenantModule } from './common/tenant/tenant.module.js';
import { TenantMiddleware } from './common/middleware/tenant/tenant.middleware.js';
import { ProductsController } from './products/products.controller.js';
import { CustomersController } from './customers/customers.controller.js';
import { OrdersController } from './orders/orders.controller.js';
import { StoreMembersController } from './store-members/store-members.controller.js';

@Module({
  imports: [
    DrizzleModule.forRoot({
      drizzle,
      connection: process.env.DATABASE_URL!,
    }),
    ClsModule.forRoot({ global: true }),
    TenantModule,
    UsersModule,
    AuthModule,
    StoresModule,
    StoreMembersModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes(
        ProductsController,
        CustomersController,
        OrdersController,
        StoreMembersController,
        { path: 'stores/current', method: RequestMethod.ALL },
      );
  }
}