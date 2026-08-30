import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { GetProgressQuery } from './dto/get-progress-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Roles(Role.USUARIO, Role.ADMIN)
  @Post('sessions')
  createSession(@Body() dto: CreateSessionDto) {
    return this.progress.ensureSession(dto.sessionToken);
  }

  @Roles(Role.USUARIO, Role.ADMIN)
  @Post('attempts')
  createAttempt(@Body() dto: CreateAttemptDto) {
    return this.progress.recordAttempt(dto);
  }

  @Roles(Role.USUARIO, Role.ADMIN, Role.AUDITOR)
  @Get('progress')
  getProgress(@Query() query: GetProgressQuery) {
    return this.progress.getProgress(query.sessionToken);
  }
}
