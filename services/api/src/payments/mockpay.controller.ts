import { Controller, Post, Body } from '@nestjs/common';
import { MockpayService } from './mockpay.service';

@Controller('mockpay')
export class MockpayController {
  constructor(private svc: MockpayService) {}

  @Post('pay')
  async pay(@Body() body: { orderId: string; force?: 'success' | 'fail'; delayMs?: number; successRate?: number }) {
    return this.svc.pay(body.orderId, body.force, body.delayMs, body.successRate);
  }
}
