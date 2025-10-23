import { Controller, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateQrPng, generateQrPdf, signPayload } from '../qrcode/qrcode.util';

const prisma = new PrismaClient();

@Controller('webhooks/mockpay')
export class MockpayWebhookController {
  @Post()
  async handle(@Body() body: { orderId: string; status: string; type?: string }) {
    const { orderId, status } = body;
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { tickets: true } });
    if (!order) return { ok: false };
    if (status === 'payment_succeeded') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
      // create tickets if none
      if (!order.tickets || order.tickets.length === 0) {
        // For demo: create 1 ticket per 1 unit of amount? Better: assume items stored elsewhere. Create single ticket.
        const ticket = await prisma.ticket.create({ data: { serial: `T-${Date.now()}`, ticketTypeId: (await prisma.ticketType.findFirst())!.id, ownerId: order.userId, orderId: order.id } });
        const payload = signPayload({ ticketId: ticket.id }, process.env.JWT_SECRET || 'secret');
        await prisma.ticket.update({ where: { id: ticket.id }, data: { qrPayload: JSON.stringify(payload) } });
        await generateQrPng(ticket.id, payload);
        await generateQrPdf(ticket.id, payload);
      }
    } else if (status === 'payment_failed') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
    } else if (body.type === 'DISPUTE_OPENED') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'PENDING' } });
      // mark tickets on hold
      await prisma.ticket.updateMany({ where: { orderId }, data: { status: 'ACTIVE' } });
    }
    return { ok: true };
  }
}
