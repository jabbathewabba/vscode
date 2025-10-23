import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('events/:id/overview')
  async overview(@Param('id') id: string) {
    return this.svc.overview(id);
  }

  @Get('events/:id/timeseries')
  async timeseries(@Param('id') id: string, @Query('granularity') granularity: string) {
    const g = granularity ? parseInt(granularity.replace('m','')) : 15;
    return this.svc.timeseries(id, g);
  }

  @Get('export.csv')
  async exportCsv(@Query('eventId') eventId: string) {
    const file = await this.svc.exportCsv(eventId);
    return { path: file };
  }
}
