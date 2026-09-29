// Run only on the VPS. Keep credentials out of command arguments and logs.
const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env.production.local'), quiet: true });
const jobs = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).crons;
const name = process.argv[2];
const job = jobs.find((item) => item.path === `/api/cron/${name}`);

async function main() {
  if (!job) throw new Error('Unknown scheduled job');
  if (!process.env.CRON_SECRET) throw new Error('CRON_SECRET is required');
  const response = await fetch(`http://127.0.0.1:3100${job.path}`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    redirect: 'error',
    signal: AbortSignal.timeout(30 * 60 * 1000),
  });
  // Response bodies can contain subscriber addresses or external service details.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.success === false || result.error || result.errors?.length) {
    throw new Error('Job reported failures; inspect application logs');
  }
  console.log(`${name}: completed`);
}

main().catch((error) => {
  console.error(`${name || 'cron'}: ${error.message}`);
  process.exitCode = 1;
});
