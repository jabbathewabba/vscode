import { Controller, Get, Query } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let cache: string[] = [];
let lastRefresh = 0;

async function refreshCache() {
  const events = await prisma.event.findMany({ take: 100, select: { title: true } });
  cache = events.map(e => e.title);
  lastRefresh = Date.now();
}

refreshCache();

@Controller('search')
export class SuggestController {
  @Get('suggest')
  async suggest(@Query('q') q: string) {
    if (Date.now() - lastRefresh > 60*1000) await refreshCache();
    if (!q) return [];
    const res = cache.filter(t => t.toLowerCase().includes(q.toLowerCase())).slice(0,5);
    return res.map(s => ({ text: s }));
  }
}
