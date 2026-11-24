import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { demoClips, demoLoadouts, demoPackages, demoProfile } from '../shared/demoData';
import { createDb } from './client';
import { codmLoadouts, creatorProfile, highlightClips, sponsorPackages } from './schema';

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed Neon. Add it to .env, then run npm run db:seed.');
}

const db = createDb(databaseUrl);

async function resetSerial(table: 'highlight_clips' | 'codm_loadouts' | 'sponsor_packages') {
  await db.execute(sql.raw(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), 1), true)`));
}

async function seed() {
  const profile = { ...demoProfile, updatedAt: new Date() };
  const { id: profileId, ...profileFields } = profile;
  await db.insert(creatorProfile).values({ id: profileId, ...profileFields })
    .onConflictDoUpdate({ target: creatorProfile.id, set: { ...profileFields, updatedAt: new Date() } });

  for (const clip of demoClips) {
    await db.insert(highlightClips).values(clip)
      .onConflictDoUpdate({ target: highlightClips.id, set: clip });
  }
  for (const loadout of demoLoadouts) {
    await db.insert(codmLoadouts).values(loadout)
      .onConflictDoUpdate({ target: codmLoadouts.id, set: loadout });
  }
  for (const item of demoPackages) {
    await db.insert(sponsorPackages).values(item)
      .onConflictDoUpdate({ target: sponsorPackages.id, set: item });
  }

  await Promise.all([
    resetSerial('highlight_clips'),
    resetSerial('codm_loadouts'),
    resetSerial('sponsor_packages'),
  ]);
  console.log('Seeded creator profile, 3 clips, loadouts, and 3 sponsor packages. Existing inquiries were left untouched.');
}

seed().catch((error: unknown) => {
  console.error('Database seed failed:', error);
  process.exitCode = 1;
});
