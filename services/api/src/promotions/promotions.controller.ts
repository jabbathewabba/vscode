import { Controller, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('promotions')
export class PromotionsController {
  @Post('validate')
  async validate(@Body() body: { code: string }) {
    const promo = await prisma.promotion.findUnique({ where: { code: body.code } });
    if (!promo) return { valid: false };
    // basic date/usage checks
    return { valid: true, percentOff: promo.percentOff, amountOff: promo.amountOff };
  }
}
