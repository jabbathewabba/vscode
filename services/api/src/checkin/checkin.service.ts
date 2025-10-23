import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class CheckinService {
  private secret = process.env.JWT_SECRET || 'dev-secret';

  async createSnapshot(eventId: string) {
    const tickets = await prisma.ticket.findMany({ where: { ticketType: { eventId } }, select: { id: true, serial: true, status: true, owner: { select: { name: true } } } });
    const payload = { eventId, tickets, ts: new Date().toISOString() };
    const sig = crypto.createHmac('sha256', this.secret).update(JSON.stringify(payload)).digest('hex');
    return { payload, sig };
  }

  async syncResults(results: Array<{ ticketId: string; status: string; scannedAt: string; deviceId?: string }>) {
    // deduplicate by ticketId and last write wins
    for (const r of results) {
      await prisma.ticket.updateMany({ where: { id: r.ticketId, status: { not: 'USED' } }, data: { status: r.status === 'USED' ? 'USED' : r.status } });
      // optionally create an audit row
    }
    return { ok: true };
  }
}
