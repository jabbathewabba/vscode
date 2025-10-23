import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

export function orgEventStorage(orgId?: string, eventId?: string) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const o = orgId || req.body.orgId || 'org_temp';
      const e = eventId || req.body.eventId || 'event_temp';
      const uploadPath = path.join(process.cwd(), 'services', 'api', 'uploads', 'org', o, 'events', e);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `${unique}${ext}`);
    },
  });
}

export const mediaUpload = (orgId?: string, eventId?: string) => multer({
  storage: orgEventStorage(orgId, eventId),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = (file.originalname && file.originalname.split('.').pop()) || '';
    const ok = allowed.includes('.' + ext.toLowerCase());
    cb(null, ok);
  },
});
