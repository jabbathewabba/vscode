import { Controller, Post, UseInterceptors, UploadedFile, Body, Req, Param, Get, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mediaUpload } from './disk.storage';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', mediaUpload()))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    // role checks expected to be done via guard; assume req.user
    const orgId = body.orgId || req.user?.organizationId;
    const eventId = body.eventId;
    const recs = await this.mediaService.saveUploadedFile(orgId, eventId, file.path);
    return recs;
  }

  @Post('propose')
  @UseInterceptors(FileInterceptor('file', mediaUpload()))
  async propose(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException();
    const orgId = body.orgId;
    const eventId = body.eventId;
    const recs = await this.mediaService.proposeUGC(userId, orgId, eventId, file.path);
    return recs;
  }

  @Get('/events/:id')
  async listForEvent(@Param('id') id: string) {
    return this.mediaService.listForEvent(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.mediaService.approve(id, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.mediaService.reject(id, userId);
  }
}
