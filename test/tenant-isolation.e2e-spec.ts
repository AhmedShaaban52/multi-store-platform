import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Tenant isolation (e2e)', () => {
  let app: INestApplication;
  const rnd = Math.random().toString(36).slice(2, 7);
  const slugA = `a${rnd}`;
  const slugB = `b${rnd}`;
  let tokenA: string;
  let tokenB: string;
  let productB: number;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const reg = (email: string) =>
      http().post('/auth/register').send({ email, password: 'password123', firstName: 'T', lastName: 'T' });
    tokenA = (await reg(`a${rnd}@test.com`)).body.accessToken;
    tokenB = (await reg(`b${rnd}@test.com`)).body.accessToken;

    await http().post('/stores').set('Authorization', `Bearer ${tokenA}`).send({ name: 'A', slug: slugA }).expect(201);
    await http().post('/stores').set('Authorization', `Bearer ${tokenB}`).send({ name: 'B', slug: slugB }).expect(201);

    await http().post('/products').set('Authorization', `Bearer ${tokenA}`).set('x-store-slug', slugA)
      .send({ slug: 'p', name: 'Product A', price: 100, stock: 5 }).expect(201);
    const b = await http().post('/products').set('Authorization', `Bearer ${tokenB}`).set('x-store-slug', slugB)
      .send({ slug: 'p', name: 'Product B', price: 200, stock: 5 }).expect(201);
    productB = b.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('each store only sees its own products', async () => {
    const a = await http().get('/products').set('x-store-slug', slugA).expect(200);
    const b = await http().get('/products').set('x-store-slug', slugB).expect(200);
    expect(a.body.map((p: any) => p.name)).toEqual(['Product A']);
    expect(b.body.map((p: any) => p.name)).toEqual(['Product B']);
  });

  it('a member of A cannot write to store B', async () => {
    await http().post('/products').set('Authorization', `Bearer ${tokenA}`).set('x-store-slug', slugB)
      .send({ slug: 'hack', name: 'x', price: 1 }).expect(403);
  });

  it("store A cannot edit or delete store B's product by id", async () => {
    await http().patch(`/products/${productB}`).set('Authorization', `Bearer ${tokenA}`).set('x-store-slug', slugA)
      .send({ price: 1 }).expect(404);
    await http().delete(`/products/${productB}`).set('Authorization', `Bearer ${tokenA}`).set('x-store-slug', slugA)
      .expect(404);
  });

  it('a customer token from store A is rejected on store B', async () => {
    const c = await http().post('/customers/register').set('x-store-slug', slugA)
      .send({ email: 'c@test.com', password: 'password123', name: 'C' }).expect(201);
    await http().get('/customers/me').set('Authorization', `Bearer ${c.body.accessToken}`).set('x-store-slug', slugB)
      .expect(401);
  });
});