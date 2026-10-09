import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import { storeMembers, users, type MemberRole } from '../db/schema.js';
import { isUniqueViolation } from '../common/utils/db-errors.js';
import { TenantService } from '../common/tenant/tenant.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class StoreMembersService {
  constructor(
    @InjectDrizzle() private readonly db: NodePgDatabase,
    private readonly tenant: TenantService,
    private readonly users: UsersService,
  ) {}

  list() {
    return this.db
      .select({
        id: storeMembers.id,
        role: storeMembers.role,
        userId: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(storeMembers)
      .innerJoin(users, eq(users.id, storeMembers.userId))
      .where(eq(storeMembers.storeId, this.tenant.getStoreId()));
  }

  async add(email: string, role: Exclude<MemberRole, 'owner'>) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new NotFoundException('No user with this email');
    try {
      const [member] = await this.db
        .insert(storeMembers)
        .values({ storeId: this.tenant.getStoreId(), userId: user.id, role })
        .returning();
      return member;
    } catch (e) {
      if (isUniqueViolation(e)) throw new ConflictException('User is already a member');
      throw e;
    }
  }

  private async findInStore(id: number) {
    const [member] = await this.db
      .select()
      .from(storeMembers)
      .where(and(eq(storeMembers.id, id), eq(storeMembers.storeId, this.tenant.getStoreId())));
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'owner') throw new ForbiddenException('The owner cannot be modified');
    return member;
  }

  async updateRole(id: number, role: Exclude<MemberRole, 'owner'>) {
    await this.findInStore(id);
    const [member] = await this.db.update(storeMembers).set({ role }).where(eq(storeMembers.id, id)).returning();
    return member;
  }

  async remove(id: number) {
    await this.findInStore(id);
    await this.db.delete(storeMembers).where(eq(storeMembers.id, id));
    return { deleted: true };
  }
}