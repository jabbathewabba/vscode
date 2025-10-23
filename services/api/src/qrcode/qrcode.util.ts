import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import * as crypto from 'crypto';

export async function generateQrPng(ticketId: string, payload: any) {
  const uploads = path.join(process.cwd(), 'services', 'api', 'uploads', 'qr');
  fs.mkdirSync(uploads, { recursive: true });
  const filePath = path.join(uploads, `${ticketId}.png`);
  const png = await QRCode.toFile(filePath, JSON.stringify(payload), { type: 'png' });
  return `/static/qr/${ticketId}.png`;
}

export async function generateQrPdf(ticketId: string, payload: any) {
  const uploads = path.join(process.cwd(), 'services', 'api', 'uploads', 'qr');
  fs.mkdirSync(uploads, { recursive: true });
  const filePath = path.join(uploads, `${ticketId}.pdf`);
  const doc = new PDFDocument({ size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));
  const base64 = dataUrl.split(',')[1];
  const img = Buffer.from(base64, 'base64');
  doc.image(img, { fit: [300, 300], align: 'center' });
  doc.end();
  return new Promise((resolve) => {
    stream.on('finish', () => resolve(`/static/qr/${ticketId}.pdf`));
  });
}

export function signPayload(payload: object, secret: string) {
  const nonce = crypto.randomBytes(8).toString('hex');
  const data = { ...payload, nonce };
  const hmac = crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
  return { ...data, sig: hmac };
}
