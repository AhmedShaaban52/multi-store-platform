import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { NewUser, users } from '../db/schema.js';


export const safeUserColumns = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  isActive: users.isActive,
};

@Injectable()
export class UsersService {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async create(data: NewUser) {
    const [user] = await this.db.insert(users).values(data).returning(safeUserColumns);
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findOne(id: number) {
    const [user] = await this.db.select(safeUserColumns).from(users).where(eq(users.id, id));
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }
}