import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

export const stores = pgTable('stores', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  customDomain: text('custom_domain').unique(),
  plan: text().notNull().default('free'),
  settings: jsonb(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const memberRole = pgEnum('member_role', ['owner', 'admin', 'staff']);

export const storeMembers = pgTable('store_members', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: memberRole('role').notNull().default('staff'),
}, (t) => [unique().on(t.storeId, t.userId)]);


export const products = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer('store_id').notNull().references(() => stores.id),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),          
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.storeId, t.slug),
  index().on(t.storeId),
]);

export const customers = pgTable('customers', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer('store_id').notNull().references(() => stores.id),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
}, (t) => [unique().on(t.storeId, t.email)]);

export const orderStatus = pgEnum('order_status',
  ['pending', 'paid', 'shipped', 'delivered', 'cancelled']);

export const orders = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  storeId: integer('store_id').notNull().references(() => stores.id),
  customerId: integer('customer_id').notNull().references(() => customers.id),
  orderNumber: integer('order_number').notNull(),
  status: orderStatus('status').notNull().default('pending'),
  total: integer('total').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.storeId, t.orderNumber),
  index().on(t.storeId, t.status),
]);

export const orderItems = pgTable('order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type MemberRole = (typeof memberRole.enumValues)[number];