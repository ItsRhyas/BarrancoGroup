import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecordAttemptInput {
  levelId: string;
  success: boolean;
  endingId?: string;
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string) {
    return this.prisma.gameSession.create({
      data: { userId },
    });
  }

  async recordAttempt(userId: string, input: RecordAttemptInput) {
    return this.prisma.$transaction(async (tx) => {
      let session = await tx.gameSession.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        session = await tx.gameSession.create({ data: { userId } });
      }

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

  async getProgress(userId: string) {
    const attempts = await this.prisma.attempt.findMany({
      where: { session: { userId }, success: true },
      select: { levelId: true },
    });

    const completedLevels = [...new Set(attempts.map((a) => a.levelId))].sort();

    return { completedLevels };
  }
}
