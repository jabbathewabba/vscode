import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class EventsService {
  async create(data: any, user: any) {
    if (!['ORGANIZER','ADMIN'].includes(user.role)) throw new ForbiddenException();
    // basic validation done via DTO
    const event = await prisma.event.create({ data: { ...data, organizerId: user.id } });
    return event;
  }

  async update(id: string, data: any, user: any) {
    const ev = await prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Event not found');
    if (ev.organizerId !== user.id && user.role !== 'ADMIN') throw new ForbiddenException();
    return prisma.event.update({ where: { id }, data });
  }

  async publish(id: string, user: any) {
    const ev = await prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Event not found');
    if (ev.organizerId !== user.id && user.role !== 'ADMIN') throw new ForbiddenException();
    // ensure at least one ticketType
    const count = await prisma.ticketType.count({ where: { eventId: id } });
    if (count === 0) throw new BadRequestException('At least one ticket type required to publish');
    // capacity coherence check optional
    return prisma.event.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  async archive(id: string, user: any) {
    const ev = await prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException('Event not found');
    if (ev.organizerId !== user.id && user.role !== 'ADMIN') throw new ForbiddenException();
    return prisma.event.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  async findOne(id: string) {
    return prisma.event.findUnique({ where: { id } });
  }

  async findAll() {
    return prisma.event.findMany();
  }
}
