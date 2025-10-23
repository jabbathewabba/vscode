import { Controller, Post, Req, Body } from '@nestjs/common';
import { ReferralsService } from './referrals.service';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly svc: ReferralsService) {}

  @Post('generate')
  async generate(@Req() req: any) {
    const userId = req.user?.id;
    return this.svc.generate(userId);
  }

  @Post('redeem')
  async redeem(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id;
    const { code } = body;
    return this.svc.redeem(userId, code);
  }
}
