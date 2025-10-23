import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

@Injectable()
export class AnalyticsService {
  async overview(eventId: string) {
    // sales per ticket type
    const sales = await prisma.purchase.groupBy({ by: ['ticketTypeId'], where: { eventId }, _sum: { amount: true }, _count: { id: true } });
    // revenue gross/net assuming platform fee 5%
    let totalGross = 0;
    for (const s of sales) totalGross += (s._sum.amount || 0);
    const platformFee = 0.05;
    const net = totalGross * (1 - platformFee);
    // views/addToCart/purchases
    const views = await prisma.eventView.count({ where: { eventId } });
    const atc = await prisma.addToCart.count({ where: { eventId } });
    const purchases = await prisma.purchase.count({ where: { eventId } });
    const conversion = views ? (purchases / views) : 0;
    // no-show estimate: tickets not USED after event end
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    const noShow = await prisma.ticket.count({ where: { ticketType: { eventId }, status: { not: 'USED' } } });
    return { sales, totalGross, net, views, atc, purchases, conversion, noShow, event }; 
  }

  async timeseries(eventId: string, granularityMinutes = 15) {
    // simple timeseries based on purchases createdAt bucketed
    const purchases = await prisma.purchase.findMany({ where: { eventId }, select: { createdAt: true, amount: true } });
    const buckets: Record<string, { ts: string; amount: number; count: number }> = {};
    for (const p of purchases) {
      const ts = Math.floor(new Date(p.createdAt).getTime() / (granularityMinutes * 60 * 1000)) * (granularityMinutes * 60 * 1000);
      const key = new Date(ts).toISOString();
      buckets[key] = buckets[key] || { ts: key, amount: 0, count: 0 };
      buckets[key].amount += p.amount;
      buckets[key].count += 1;
    }
    return Object.values(buckets).sort((a,b)=>a.ts.localeCompare(b.ts));
  }

  async exportCsv(eventId: string) {
    const purchases = await prisma.purchase.findMany({ where: { eventId }, include: { user: true, order: true, ticketType: true } });
    const rows = purchases.map(p => ({ id: p.id, user: p.user?.email, amount: p.amount, ticketType: p.ticketType?.name, createdAt: p.createdAt }));
    const csv = ['id,user,amount,ticketType,createdAt', ...rows.map(r => `${r.id},${r.user || ''},${r.amount},${r.ticketType || ''},${r.createdAt.toISOString()}`)].join('\n');
    const dir = path.join(process.cwd(), 'services', 'api', 'exports');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `export-${eventId}-${Date.now()}.csv`);
    fs.writeFileSync(file, csv);
    await prisma.analyticsExport.create({ data: { eventId, path: file } });
    return file;
  }
}
