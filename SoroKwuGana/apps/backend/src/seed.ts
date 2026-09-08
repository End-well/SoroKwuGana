import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/database.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';

async function main() {
  await connectDB();
  console.log('🌱 Seeding database...');

  // ── Admin user ──────────────────────────────────────────────────────────────
  const email    = process.env.ADMIN_EMAIL    ?? 'sorokwugana@gmail.com';
  const password = process.env.ADMIN_PASSWORD ?? 'sorokwugana1206';
  const hashed   = await bcrypt.hash(password, 12);

  await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name: 'Admin', email, password: hashed, role: 'SUPER_ADMIN' } },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin user: ${email}`);

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = [
    { name: 'Movies',    slug: 'movies',    parent: 'entertainment' },
    { name: 'TV Shows',  slug: 'tv-shows',  parent: 'entertainment' },
    { name: 'Music',     slug: 'music',     parent: 'entertainment' },
    { name: 'Celebrity', slug: 'celebrity', parent: 'entertainment' },
    { name: 'Fashion',   slug: 'fashion',   parent: 'lifestyle' },
    { name: 'Beauty',    slug: 'beauty',    parent: 'lifestyle' },
    { name: 'Health',    slug: 'health',    parent: 'lifestyle' },
    { name: 'Travel',    slug: 'travel',    parent: 'lifestyle' },
    { name: 'Food',      slug: 'food',      parent: 'lifestyle' },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${categories.length} categories seeded`);

  console.log('🎉 Seeding complete');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
