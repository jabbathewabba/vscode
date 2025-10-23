import { Controller, Get, Req, Post, Param } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('notifications')
export class NotificationsController {
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }
}
