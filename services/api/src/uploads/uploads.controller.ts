import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from '../storage/local.storage';
import * as path from 'path';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(FileInterceptor('file', upload()))
  uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // return the public path
    const relative = path.relative(path.join(process.cwd(), 'services', 'api', 'uploads'), file.path);
    return { path: `/static/${relative.replace(/\\/g, '/')}` };
  }
}
