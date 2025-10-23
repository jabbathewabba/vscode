import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { generateVariants } from './image.processor';

const prisma = new PrismaClient();

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  async saveUploadedFile(orgId: string | undefined, eventId: string | undefined, filePath: string) {
    // generate variants
    const variants = await generateVariants(filePath);

    const records = [];
    for (const v of variants) {
      const rel = path.relative(path.join(process.cwd(), 'services', 'api', 'uploads'), v.path);
      const rec = await prisma.media.create({
        data: {
          orgId: orgId,
          eventId: eventId,
          path: rel.replace(/\\/g, '/'),
          variant: v.variant,
          width: v.width,
          height: v.height,
          status: 'APPROVED',
        },
      });
      records.push(rec);
    }
    return records;
  }

  async proposeUGC(userId: string, orgId: string | undefined, eventId: string, filePath: string) {
    // Check limit: max 5 pending per event per user
    const pending = await prisma.media.count({ where: { eventId, status: 'PENDING', orgId } });
    if (pending >= 5) throw new Error('Limit reached');
    const variants = await generateVariants(filePath);
    const recs = [];
    for (const v of variants) {
      const rel = path.relative(path.join(process.cwd(), 'services', 'api', 'uploads'), v.path);
      const rec = await prisma.media.create({
        data: {
          orgId,
          eventId,
          path: rel.replace(/\\/g, '/'),
          variant: v.variant,
          width: v.width,
          height: v.height,
          status: 'PENDING',
          metadata: { proposedBy: userId },
        },
      });
      recs.push(rec);
    }
    return recs;
  }

  async listForEvent(eventId: string) {
    return prisma.media.findMany({ where: { eventId, status: 'APPROVED' }, orderBy: { createdAt: 'desc' } });
  }

  async approve(mediaId: string, approverId: string) {
    return prisma.media.update({ where: { id: mediaId }, data: { status: 'APPROVED', metadata: { ...{ approvedBy: approverId, approvedAt: new Date() } } } });
  }

  async reject(mediaId: string, approverId: string) {
    return prisma.media.update({ where: { id: mediaId }, data: { status: 'REJECTED', metadata: { ...{ rejectedBy: approverId, rejectedAt: new Date() } } } });
  }
}
