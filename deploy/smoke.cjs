// Read-only deployment checks. Does not trigger AI, payments, email or social jobs.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { MongoClient } = require('mongodb');
const root = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(root, '.env.production.local'), quiet: true });

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db('myrashifal').command({ ping: 1 });
    const collections = await client.db('myrashifal').listCollections({}, { nameOnly: true }).toArray();
    console.log(`Authenticated database check passed (${collections.length} collections).`);
  } finally { await client.close(); }

  const anonymous = new MongoClient('mongodb://127.0.0.1:27017/myrashifal', { serverSelectionTimeoutMS: 5000 });
  try {
    await anonymous.connect();
    await assert.rejects(anonymous.db().listCollections().toArray(), (error) => error.code === 13);
    console.log('Database rejects unauthenticated reads.');
  } finally { await anonymous.close(); }

  const checks = [
    ['/', 200], ['/kundli', 200], ['/rashifal', 200], ['/reports', 200],
    ['/logo.png', 200], ['/robots.txt', 200], ['/sitemap.xml', 200],
    ['/api/auth/session', 200], ['/api/auth/providers', 200],
    ['/api/user/data', 401], ['/api/panchang?date=2026-09-29&city=Pune', 200],
    ['/api/cron/instagram-morning', 401],
  ];
  for (const [url, status] of checks) {
    const response = await fetch(`http://127.0.0.1:3100${url}`, {
      signal: AbortSignal.timeout(15000),
      headers: { Host: 'myrashifal.in', 'X-Forwarded-Proto': 'https' },
    });
    assert.equal(response.status, status, `${url}: HTTP ${response.status}`);
    if (url === '/api/auth/providers') {
      const providers = await response.json();
      assert.equal(providers.google.callbackUrl, 'https://myrashifal.in/api/auth/callback/google');
    } else { await response.arrayBuffer(); }
    console.log(`${url}: ${status}`);
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '.next/build-manifest.json')));
  const asset = manifest.rootMainFiles.find((file) => file.endsWith('.js'));
  const staticResponse = await fetch(`http://127.0.0.1:3100/_next/${asset}`);
  assert.equal(staticResponse.status, 200);
  await staticResponse.arrayBuffer();
  console.log('Built JavaScript asset: 200');
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
