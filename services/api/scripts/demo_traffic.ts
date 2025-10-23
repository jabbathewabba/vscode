import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({ take: 2 });
  for (const e of events) {
    // generate views
    for (let i=0;i<200;i++) await prisma.eventView.create({ data: { eventId: e.id } });
    // add to cart
    for (let i=0;i<50;i++) await prisma.addToCart.create({ data: { eventId: e.id, quantity: 1 } });
    // purchases
    for (let i=0;i<30;i++) await prisma.purchase.create({ data: { eventId: e.id, amount: 20 + Math.random()*50 } });
  }
  console.log('Demo traffic seeded');
}

main().catch(e => { console.error(e); process.exit(1); });
