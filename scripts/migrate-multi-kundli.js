/**
 * Migration: Add kundliId, label, isPrimary to existing kundlis
 * and assign kundliId to existing purchases/reports.
 *
 * Run: node scripts/migrate-multi-kundli.js
 * Requires: MONGODB_URI env var (set in .env.local or export before running)
 */

import { MongoClient } from 'mongodb';
import { nanoid } from 'nanoid';
import { config } from 'dotenv';

// Load .env.local
config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set. Add it to .env.local or export it.');
  process.exit(1);
}

async function migrate() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('myrashifal');

  console.log('Starting multi-kundli migration...\n');

  // 1. Migrate kundlis: add kundliId, label, isPrimary
  const kundlis = db.collection('kundlis');
  const kundlisWithoutId = await kundlis.find({ kundliId: { $exists: false } }).toArray();
  console.log(`Found ${kundlisWithoutId.length} kundlis without kundliId`);

  const userKundliMap = {}; // userId → kundliId

  for (const k of kundlisWithoutId) {
    const kundliId = nanoid(12);
    const label = k.birthDetails?.name || '';
    await kundlis.updateOne(
      { _id: k._id },
      {
        $set: {
          kundliId,
          label,
          isPrimary: true,
          updatedAt: new Date(),
        },
      }
    );
    userKundliMap[k.userId] = kundliId;
    console.log(`  Migrated kundli for user ${k.userId} → kundliId: ${kundliId}`);
  }

  // 2. Migrate purchases: add kundliId and isFree
  const purchases = db.collection('purchases');
  const purchasesWithoutKundli = await purchases.find({ kundliId: { $exists: false } }).toArray();
  console.log(`\nFound ${purchasesWithoutKundli.length} purchases without kundliId`);

  for (const p of purchasesWithoutKundli) {
    const kundliId = userKundliMap[p.userId] || null;
    await purchases.updateOne(
      { _id: p._id },
      {
        $set: {
          kundliId,
          isFree: p.isFree || false,
        },
      }
    );
  }
  console.log('  Purchases migrated.');

  // 3. Migrate reports: add kundliId
  const reports = db.collection('reports');
  const reportsWithoutKundli = await reports.find({ kundliId: { $exists: false } }).toArray();
  console.log(`\nFound ${reportsWithoutKundli.length} reports without kundliId`);

  for (const r of reportsWithoutKundli) {
    const kundliId = userKundliMap[r.userId] || null;
    await reports.updateOne(
      { _id: r._id },
      { $set: { kundliId } }
    );
  }
  console.log('  Reports migrated.');

  // 4. Create indexes
  console.log('\nCreating indexes...');
  await kundlis.createIndex({ userId: 1, kundliId: 1 }, { unique: true });
  await kundlis.createIndex({ userId: 1, isPrimary: 1 });
  await purchases.createIndex({ userId: 1, reportType: 1, kundliId: 1 });
  await reports.createIndex({ userId: 1, reportType: 1, kundliId: 1 });
  console.log('  Indexes created.');

  console.log('\nMigration complete!');
  await client.close();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
