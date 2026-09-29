// Execute once using mongosh on the VPS as root, via MongoDB's localhost exception.
// Credentials are generated and saved locally; none are printed.
async function initialize() {
const fs = require('node:fs');
const crypto = require('node:crypto');
const secretDir = '/root/.config/myrashifal';
fs.mkdirSync(secretDir, { recursive: true, mode: 0o700 });
const secrets = {
  adminUser: 'myrashifalAdmin',
  adminPassword: crypto.randomBytes(32).toString('hex'),
  appUser: 'myrashifalApp',
  appPassword: crypto.randomBytes(32).toString('hex'),
};
fs.writeFileSync(`${secretDir}/mongodb.json`, JSON.stringify(secrets), {
  mode: 0o600, flag: 'wx',
});
const admin = db.getSiblingDB('admin');
await admin.createUser({
  user: secrets.adminUser, pwd: secrets.adminPassword,
  roles: [{ role: 'root', db: 'admin' }],
});
await admin.auth(secrets.adminUser, secrets.adminPassword);
await db.getSiblingDB('myrashifal').createUser({
  user: secrets.appUser, pwd: secrets.appPassword,
  roles: [{ role: 'readWrite', db: 'myrashifal' }],
});
const appUri = `mongodb://${secrets.appUser}:${secrets.appPassword}@127.0.0.1:27017/myrashifal?authSource=myrashifal`;
fs.appendFileSync('/opt/myrashifal/shared/.env.production.local',
  `\nMONGODB_URI=${appUri}\nCRON_SECRET=${crypto.randomBytes(32).toString('hex')}\n`);
print('MongoDB application user and private credentials created.');
}
initialize().catch((error) => {
  console.error(error.message);
  quit(1);
});
