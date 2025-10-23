import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // create a default user/organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'org@example.com' },
    update: {},
    create: { email: 'org@example.com', name: 'Default Organizer', role: 'ORGANIZER', passwordHash: await bcrypt.hash('organizer123!', 10) }
  });

  // create admin user
  const adminPwd = 'admin123!';
  const adminHash = await bcrypt.hash(adminPwd, 10);
  await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: { email: 'admin@local.test', name: 'Local Admin', role: 'ADMIN', passwordHash: adminHash }
  });

  const venue1 = await prisma.venue.upsert({
    where: { slug: 'central-park-hall' },
    update: {},
    create: {
      name: 'Central Park Hall',
      slug: 'central-park-hall',
      address: '1 Central Park West',
      city: 'New York',
      country: 'US',
      latitude: 40.771133,
      longitude: -73.974187
    }
  });

  const venue2 = await prisma.venue.upsert({
    where: { slug: 'riverfront-venue' },
    update: {},
    create: {
      name: 'Riverfront Venue',
      slug: 'riverfront-venue',
      address: '10 River Rd',
      city: 'Boston',
      country: 'US',
      latitude: 42.360091,
      longitude: -71.05888
    }
  });

  const startAt1 = new Date();
  startAt1.setDate(startAt1.getDate() + 10);
  const endAt1 = new Date(startAt1);
  endAt1.setHours(endAt1.getHours() + 3);

  const event1 = await prisma.event.upsert({
    where: { slug: 'summer-concert' },
    update: {},
    create: {
      title: 'Summer Concert',
      slug: 'summer-concert',
      description: 'An open-air summer concert.',
      organizerId: organizer.id,
      venueId: venue1.id,
      categories: JSON.stringify(['music']),
      tags: JSON.stringify(['summer','outdoor']),
      startAt: startAt1,
      endAt: endAt1,
      status: 'PUBLISHED',
      capacity: 500
    }
  });

  const startAt2 = new Date();
  startAt2.setDate(startAt2.getDate() + 20);
  const endAt2 = new Date(startAt2);
  endAt2.setHours(endAt2.getHours() + 2);

  const event2 = await prisma.event.upsert({
    where: { slug: 'tech-meetup' },
    update: {},
    create: {
      title: 'Tech Meetup',
      slug: 'tech-meetup',
      description: 'Community tech meetup.',
      organizerId: organizer.id,
      venueId: venue2.id,
      categories: JSON.stringify(['tech']),
      tags: JSON.stringify(['networking','talks']),
      startAt: startAt2,
      endAt: endAt2,
      status: 'PUBLISHED',
      capacity: 200
    }
  });

  // create ticket types for events
  await prisma.ticketType.upsert({
    where: { id: 'tt-demo-1' },
    update: {},
    create: { id: 'tt-demo-1', eventId: event1.id, name: 'General Admission', price: 20.0 }
  }).catch(()=>{});

  await prisma.ticketType.upsert({
    where: { id: 'tt-demo-2' },
    update: {},
    create: { id: 'tt-demo-2', eventId: event2.id, name: 'VIP', price: 50.0 }
  }).catch(()=>{});

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
