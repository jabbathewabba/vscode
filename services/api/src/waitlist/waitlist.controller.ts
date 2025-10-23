import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('waitlist')
export class WaitlistController {
  @UseGuards()
  @Post(':eventId')
  async join(@Param('eventId') eventId: string, @Request() req: any) {
    const entry = await prisma.waitlistEntry.create({ data: { eventId, userId: req.user.id } });
    return entry;
  }

  // manual trigger to notify next in line (for demo/testing)
  @Post(':eventId/notify-next')
  async notify(@Param('eventId') eventId: string) {
    const next = await prisma.waitlistEntry.findFirst({ where: { eventId }, orderBy: { createdAt: 'asc' } });
    if (!next) return { ok: false };
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    const reservation = await prisma.reservation.create({ data: { eventId, userId: next.userId, expiresAt } });
    return { reservation };
  }
}
