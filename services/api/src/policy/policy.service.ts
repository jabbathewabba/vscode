import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RateMap = Record<string, { count: number; firstTs: number }>;

@Injectable()
export class PolicyService {
  private exportRate: RateMap = {};
  private wipeRate: RateMap = {};
  private WINDOW_MS = 60_000; // 1 minute window
  private MAX_EXPORTS = 2;
  private MAX_WIPES = 1;

  checkRate(map: RateMap, key: string, max: number) {
    const now = Date.now();
    const rec = map[key];
    if (!rec) {
      map[key] = { count: 1, firstTs: now };
      return true;
    }
    if (now - rec.firstTs > this.WINDOW_MS) {
      map[key] = { count: 1, firstTs: now };
      return true;
    }
    if (rec.count >= max) throw new ForbiddenException('Rate limit exceeded');
    rec.count += 1;
    return true;
  }

  async exportMe(userId: string) {
    this.checkRate(this.exportRate, userId, this.MAX_EXPORTS);
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true, deletedAt: true, ageConfirmedAt: true } });
    const orders = await prisma.order.findMany({ where: { userId }, include: { tickets: true } });
    const tickets = await prisma.ticket.findMany({ where: { ownerId: userId } });
    return { user, orders, tickets };
  }

  async wipeMe(userId: string) {
    this.checkRate(this.wipeRate, userId, this.MAX_WIPES);
    // Anonymize user: replace name/email with placeholders but keep orders/tickets for accounting
    const anonEmail = `anon+${userId}@example.invalid`;
    await prisma.user.update({ where: { id: userId }, data: { email: anonEmail, name: 'ANONYMIZED', updatedAt: new Date() } });
    // note: do not delete orders/tickets; optionally nullify owner names
    return { ok: true };
  }
}
