import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('orders')
export class OrdersController {
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  async refund(@Param('id') id: string) {
    const order = await prisma.order.findUnique({ where: { id }, include: { tickets: true } });
    if (!order) return { ok: false };
    await prisma.order.update({ where: { id }, data: { status: 'REFUNDED' } });
    await prisma.ticket.updateMany({ where: { orderId: id }, data: { status: 'REFUNDED' } });
    return { ok: true };
  }
}
