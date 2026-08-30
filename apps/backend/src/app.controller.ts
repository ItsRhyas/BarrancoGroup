import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const dbAlive = await this.prisma.$queryRaw`SELECT 1 AS ok`;
    return {
      status: 'ok',
      database: dbAlive,
      timestamp: new Date().toISOString(),
    };
  }
}
