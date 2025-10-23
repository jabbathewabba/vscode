import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export async function writeSnapshot(eventId: string) {
  const tickets = await prisma.ticket.findMany({ where: { ticketType: { eventId } }, select: { id: true, serial: true, status: true, owner: { select: { name: true } } } });
  const payload = { eventId, tickets, ts: new Date().toISOString() };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const sig = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  const out = { payload, sig };
  const dir = path.join(process.cwd(), 'services', 'api', 'snapshots');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${eventId}-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  return file;
}
