// Generate unit files only. This does not install, enable, or invoke any jobs.
const fs = require('node:fs');
const path = require('node:path');
const jobs = require('../vercel.json').crons;
const calendars = {
  '30 1 * * *': '*-*-* 01:30:00 UTC',
  '30 12 * * *': '*-*-* 12:30:00 UTC',
  '30 4 * * 0': 'Sun *-*-* 04:30:00 UTC',
  '0 6 1,15 * *': '*-*-01,15 06:00:00 UTC',
  '0 2 * * *': '*-*-* 02:00:00 UTC',
  '0 3 */3 * *': '*-*-01,04,07,10,13,16,19,22,25,28,31 03:00:00 UTC',
};
const output = path.join(__dirname, 'timers');
const units = jobs.map((job) => {
  const name = job.path.replace('/api/cron/', '');
  if (!/^[a-z-]+$/.test(name) || !calendars[job.schedule]) {
    throw new Error(`Unsupported cron configuration: ${job.path}`);
  }
  return {
    name,
    content: `[Unit]\nDescription=MyRashifal ${name} schedule\n\n[Timer]\nOnCalendar=${calendars[job.schedule]}\nPersistent=false\nAccuracySec=1s\nUnit=myrashifal-cron@${name}.service\n\n[Install]\nWantedBy=timers.target\n`,
  };
});
fs.mkdirSync(output, { recursive: true });
for (const unit of units) {
  fs.writeFileSync(path.join(output, `myrashifal-${unit.name}.timer`), unit.content);
}
console.log(`Generated ${units.length} timers; no jobs have been enabled.`);
