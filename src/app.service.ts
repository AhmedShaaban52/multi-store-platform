import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// @Injectable()
// export class AppService {
//   getHello(): string {
//     return 'Hello World!';
//   }
// }


@Injectable()
export class AppService {
  constructor(
    @InjectDrizzle()
    private readonly db: NodePgDatabase,
  ) {}

  async getHello(): Promise<string> {
    const result = await this.db.execute(sql`SELECT NOW()`);
    return `Hello World! DB connected, server time: ${result.rows[0].now}`;
  }
}