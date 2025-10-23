import { Controller, Post, Body, Param, Get, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('tickets')
export class TicketsController {
  constructor(private svc: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('order')
  async order(@Request() req, @Body() body: any) {
    return this.svc.createOrder(req.user.id, body.items, body.promoCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getTicket(id);
  }
}
