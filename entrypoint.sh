#!/bin/sh
set -e

DB_FILE="/app/data/database.sqlite"
LOCK_FILE="/app/data/.initialized"

if [ ! -f "$LOCK_FILE" ]; then
  echo "Running migrations..."
  npx drizzle-kit migrate

  echo "Running seed..."
  npm run seed

  touch "$LOCK_FILE"
else
  echo "Database already initialized"
fi

exec npm start