#!/bin/bash

echo "🚀 Starting Social Content AI Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
node scripts/run-migrations.js

# Start the application
echo "🚀 Starting application..."
npm start
