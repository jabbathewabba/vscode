import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

export function eventStorage(eventId?: string) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const id = eventId || req.body.eventId || 'temp';
      const uploadPath = path.join(process.cwd(), 'services', 'api', 'uploads', 'events', id);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  });
}

export const upload = (eventId?: string) => multer({
  storage: eventStorage(eventId),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
