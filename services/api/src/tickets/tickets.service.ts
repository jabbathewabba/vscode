import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateQrPng, generateQrPdf, signPayload } from '../qrcode/qrcode.util';

const prisma = new PrismaClient();

@Injectable()
export class TicketsService {
  constructor() {}

  async createOrder(userId: string, items: any[], promoCode?: string) {
    // Simplified: items = [{ ticketTypeId, qty }]
    let total = 0;
    for (const it of items) {
      const tt = await prisma.ticketType.findUnique({ where: { id: it.ticketTypeId } });
      if (!tt || !tt.isActive) throw new BadRequestException('Invalid ticket type');
      // Check event age restriction: if event.restricted and user hasn't confirmed age, block
      const event = await prisma.event.findUnique({ where: { id: tt.eventId } });
      if (event?.restricted) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.ageConfirmedAt) throw new BadRequestException('Age confirmation required for this event');
      }
      total += tt.price * it.qty;
    }
  const order = await prisma.order.create({ data: { userId, amount: total, status: 'PENDING' } });
    // create tickets (not reserved/paid logic simplified)
    for (const it of items) {
      for (let i = 0; i < it.qty; i++) {
        const ticket = await prisma.ticket.create({ data: { serial: `T-${Date.now()}-${Math.random()}`, ticketTypeId: it.ticketTypeId, ownerId: userId, orderId: order.id } });
        const payload = signPayload({ ticketId: ticket.id }, process.env.JWT_SECRET || 'secret');
        await prisma.ticket.update({ where: { id: ticket.id }, data: { qrPayload: JSON.stringify(payload) } });
        await generateQrPng(ticket.id, payload);
        await generateQrPdf(ticket.id, payload);
      }
    }
    return order;
  }

  async getTicket(ticketId: string) {
    const t = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { ticketType: true } });
    if (!t) throw new NotFoundException();
    return t;
  }
}
