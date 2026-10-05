import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase,
  ) {}

  create(dto: CreateUserDto) {
    return this.db.insert(users).values(dto).returning();
  }

  findAll() {
    return this.db.select().from(users);
  }

  async findOne(id: number) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const [user] = await this.db
      .update(users)
      .set(dto)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async remove(id: number) {
    const [user] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}