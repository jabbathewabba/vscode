import { Controller, Post, UseGuards, Body, Request, Param, Patch, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER','ADMIN')
  @Post()
  async create(@Body() body: CreateEventDto, @Request() req) {
    return this.eventsService.create(body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER','ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.eventsService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER','ADMIN')
  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() req) {
    return this.eventsService.publish(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER','ADMIN')
  @Post(':id/archive')
  async archive(@Param('id') id: string, @Request() req) {
    return this.eventsService.archive(id, req.user);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get()
  async list() {
    return this.eventsService.findAll();
  }
}
