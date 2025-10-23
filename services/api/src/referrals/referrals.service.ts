import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

@Injectable()
export class ReferralsService {
  async generate(ownerUserId: string) {
    const code = `REF-${randomBytes(4).toString('hex')}`;
    return prisma.referralCode.create({ data: { code, ownerUserId: ownerUserId } });
  }

  async redeem(userId: string, codeStr: string) {
    const code = await prisma.referralCode.findUnique({ where: { code: codeStr } });
    if (!code) throw new Error('Invalid code');
    const already = await prisma.redemption.findFirst({ where: { userId, referralCodeId: code.id } });
    if (already) throw new Error('Already redeemed');
    // give credit to user and owner
    const creditAmount = 100; // local credit unit
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { creditBalance: { increment: creditAmount } } as any }),
      prisma.user.update({ where: { id: code.ownerUserId }, data: { creditBalance: { increment: creditAmount } } as any }),
      prisma.redemption.create({ data: { userId, referralCodeId: code.id } }),
      prisma.referralCode.update({ where: { id: code.id }, data: { redeemedCount: { increment: 1 } } }),
    ]);
    return { credited: creditAmount };
  }
}
