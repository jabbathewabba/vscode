import * as fs from 'fs';
import * as path from 'path';

const uploads = path.join(process.cwd(), 'services', 'api', 'uploads');

function removeDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    const cur = path.join(dir, file);
    if (fs.lstatSync(cur).isDirectory()) removeDir(cur);
    else fs.unlinkSync(cur);
  }
  fs.rmdirSync(dir);
}

removeDir(uploads);
console.log('Uploads cleaned');
