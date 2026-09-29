#!/usr/bin/env bash
set -euo pipefail
# For a new MongoDB installation on the inspected Ubuntu 24.04 VPS only.
if command -v mongod >/dev/null; then
  echo 'MongoDB already exists; inspect it instead of replacing its configuration.' >&2
  exit 1
fi
. /etc/os-release
test "$VERSION_CODENAME" = noble
curl -fsSL https://pgp.mongodb.com/server-8.0.asc -o /tmp/myrashifal-mongodb-key.asc
gpg --batch --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg /tmp/myrashifal-mongodb-key.asc
printf '%s\n' 'deb [arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse' > /etc/apt/sources.list.d/mongodb-org-8.0.list
apt-get update -qq
DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=l apt-get install -y mongodb-org
cp -a /etc/mongod.conf /etc/mongod.conf.before-myrashifal
cat > /etc/mongod.conf <<'CONFIG'
storage:
  dbPath: /var/lib/mongodb
  wiredTiger:
    engineConfig:
      cacheSizeGB: 0.5
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
security:
  authorization: enabled
CONFIG
systemctl enable --now mongod
systemctl is-active mongod
