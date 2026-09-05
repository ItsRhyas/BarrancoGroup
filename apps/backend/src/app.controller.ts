import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { Public } from './auth/decorators/public.decorator';

@Controller('health')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
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
