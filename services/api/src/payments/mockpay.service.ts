import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as http from 'http';

const prisma = new PrismaClient();

@Injectable()
export class MockpayService {
  async pay(orderId: string, force?: 'success' | 'fail', delayMs = 2000, successRate = 0.8) {
    // decide outcome
    let success = false;
    if (force === 'success') success = true;
    else if (force === 'fail') success = false;
    else success = Math.random() < successRate;

    // schedule webhook callback
    setTimeout(async () => {
      const status = success ? 'payment_succeeded' : 'payment_failed';
      const payload = { orderId, status };

      // send a local HTTP POST to the webhook endpoint
      const body = JSON.stringify(payload);
      const opts = {
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        path: '/webhooks/mockpay',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const req = http.request(opts, (res) => {
        // noop
      });
      req.on('error', async (err) => {
        // fallback: apply changes directly if webhook not reachable
        await this.applyOutcome(orderId, success);
      });
      req.write(body);
      req.end();
    }, delayMs);

    return { ok: true, scheduled: true };
  }

  async applyOutcome(orderId: string, success: boolean) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    if (success) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
      // create tickets if not created
      // For simplicity, create one ticket per associated intended qty is not known here; real flow should pass items
    } else {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
    }
  }
}
