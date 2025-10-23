import { Controller, Post, Param, Body } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin')
export class CheckinController {
  constructor(private readonly svc: CheckinService) {}

  @Post('snapshot/:eventId')
  async snapshot(@Param('eventId') eventId: string) {
    return this.svc.createSnapshot(eventId);
  }

  @Post('sync')
  async sync(@Body() body: any) {
    return this.svc.syncResults(body.results || []);
  }
}
