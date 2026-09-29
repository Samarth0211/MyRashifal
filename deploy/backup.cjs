// Run as root on the VPS. The archive and temporary config remain private.
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { parse } = require('dotenv');
const root = '/var/backups/myrashifal';
const env = parse(fs.readFileSync('/opt/myrashifal/shared/.env.production.local'));
if (!env.MONGODB_URI) throw new Error('MONGODB_URI missing');
fs.mkdirSync(root, { recursive: true, mode: 0o700 });
process.umask(0o077);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const archive = `${root}/${stamp}.archive.gz`;
const config = `${root}/.dump-${process.pid}.json`;
fs.writeFileSync(config, JSON.stringify({ uri: env.MONGODB_URI }), { mode: 0o600, flag: 'wx' });
try {
  execFileSync('/usr/bin/mongodump', [
    '--config', config, '--db', 'myrashifal', '--gzip', `--archive=${archive}`,
  ], { stdio: 'inherit' });
  console.log(`Backup saved: ${archive}`);
  // Retain the 14 newest successful archives; never remove other file types.
  const archives = fs.readdirSync(root)
    .filter((name) => /^\d{4}-\d{2}-\d{2}T[\d-]+Z\.archive\.gz$/.test(name))
    .sort().reverse();
  for (const old of archives.slice(14)) fs.unlinkSync(`${root}/${old}`);
} catch (error) {
  if (fs.existsSync(archive)) fs.renameSync(archive, `${archive}.failed`);
  throw error;
} finally {
  fs.unlinkSync(config);
}
