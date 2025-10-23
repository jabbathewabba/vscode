import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

export async function generateVariants(filePath: string) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const variants = [
    { name: 'thumb_320', width: 320 },
    { name: 'medium_800', width: 800 },
    { name: 'full', width: null },
  ];

  const results: Array<{ variant: string; path: string; width?: number; height?: number }> = [];

  for (const v of variants) {
    const outName = `${v.name}.jpg`;
    const outPath = path.join(dir, `${base}_${outName}`);

    let img = sharp(filePath).rotate();
    if (v.width) img = img.resize(v.width, null, { fit: 'inside' });
    await img.jpeg({ quality: 85 }).toFile(outPath);
    const meta = await sharp(outPath).metadata();
    results.push({ variant: v.name, path: outPath, width: meta.width || undefined, height: meta.height || undefined });
  }

  // Optionally keep original as full if needed
  return results;
}
