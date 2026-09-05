import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPw = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'changeme123', 12);
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? 'admin@sorokwugana.com' },
    update: {},
    create: {
      name: 'Admin',
      email: process.env.ADMIN_EMAIL ?? 'admin@sorokwugana.com',
      password: hashedPw,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Categories
  const categories = [
    { name: 'Movies', slug: 'movies', parent: 'entertainment' },
    { name: 'TV Shows', slug: 'tv-shows', parent: 'entertainment' },
    { name: 'Music', slug: 'music', parent: 'entertainment' },
    { name: 'Celebrity', slug: 'celebrity', parent: 'entertainment' },
    { name: 'Fashion', slug: 'fashion', parent: 'lifestyle' },
    { name: 'Beauty', slug: 'beauty', parent: 'lifestyle' },
    { name: 'Health', slug: 'health', parent: 'lifestyle' },
    { name: 'Travel', slug: 'travel', parent: 'lifestyle' },
    { name: 'Food', slug: 'food', parent: 'lifestyle' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories seeded`);

  console.log('🎉 Seeding complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
