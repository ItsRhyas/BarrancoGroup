import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Roles(Role.USUARIO, Role.ADMIN)
  @Post('sessions')
  createSession(@CurrentUser() user: AuthenticatedUser) {
    return this.progress.createSession(user.id);
  }

  @Roles(Role.USUARIO, Role.ADMIN)
  @Post('attempts')
  createAttempt(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAttemptDto,
  ) {
    return this.progress.recordAttempt(user.id, dto);
  }

  @Roles(Role.USUARIO, Role.ADMIN, Role.AUDITOR)
  @Get('progress')
  getProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.progress.getProgress(user.id);
  }
}
