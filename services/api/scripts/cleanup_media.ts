import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const uploadsRoot = path.join(process.cwd(), 'services', 'api', 'uploads');
  const allMedia = await prisma.media.findMany();
  const mediaPaths = new Set(allMedia.map(m => path.join(uploadsRoot, m.path)));

  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else {
        if (!mediaPaths.has(full)) {
          console.log('Orphan file:', full);
          fs.unlinkSync(full);
        }
      }
    }
  }

  walk(uploadsRoot);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
