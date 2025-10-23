import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('promo')
export class PromoController {
  @Get('weekly')
  async weekly() {
    // simple static promos for demo
    return [
      { id: 'p1', title: 'Early bird 10% off', body: 'Use EARLY10 on checkout', startsAt: new Date() },
      { id: 'p2', title: 'Refer and earn', body: 'Invite a friend and get 100 credits' },
    ];
  }
}
