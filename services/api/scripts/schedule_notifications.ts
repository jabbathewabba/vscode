import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // seed a test notification for all users
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.notification.create({ data: { userId: u.id, title: 'Promo della settimana', body: 'Scopri gli eventi caldi questa settimana!', data: { promo: 'weekly' }, scheduledAt: new Date() } });
  }
  console.log('Scheduled notifications for', users.length);
}

main().catch(e => { console.error(e); process.exit(1); });
