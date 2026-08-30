import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordAttemptInput {
  sessionToken: string;
  levelId: string;
  success: boolean;
  endingId?: string;
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSession(sessionToken?: string) {
    const token = sessionToken ?? randomUUID();

    return this.prisma.gameSession.upsert({
      where: { sessionToken: token },
      create: { sessionToken: token },
      update: {},
    });
  }

  async recordAttempt(input: RecordAttemptInput) {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.gameSession.upsert({
        where: { sessionToken: input.sessionToken },
        create: { sessionToken: input.sessionToken },
        update: {},
      });

      const count = await tx.attempt.count({
        where: { sessionId: session.id, levelId: input.levelId },
      });

      return tx.attempt.create({
        data: {
          sessionId: session.id,
          levelId: input.levelId,
          success: input.success,
          endingId: input.endingId,
          attemptNumber: count + 1,
        },
      });
    });
  }

  async getProgress(sessionToken: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: { session: { sessionToken }, success: true },
      select: { levelId: true },
    });

    const completedLevels = [...new Set(attempts.map((a) => a.levelId))].sort();

    return { sessionToken, completedLevels };
  }
}
