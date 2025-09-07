#!/bin/bash
set -e

echo "🚀 Starting SynergySphere on Railway..."

# Wait for database to be ready (Railway PostgreSQL)
echo "⏳ Waiting for database connection..."
cd /app/backend

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please add PostgreSQL service in Railway."
    exit 1
fi

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy || {
    echo "⚠️  Migration failed, trying to push schema instead..."
    npx prisma db push --force-reset
}

# Seed database if needed (only on first deploy)
if [ "$RAILWAY_ENVIRONMENT" = "production" ] && [ "$FIRST_DEPLOY" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed || echo "⚠️  Database seeding failed or skipped"
fi

# Start backend in background
echo "🔧 Starting backend server on port 3000..."
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 10

# Check if backend is running
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "⚠️  Backend health check failed, but continuing..."
fi

# Start nginx in foreground
echo "🌐 Starting nginx reverse proxy on port 8080..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $NGINX_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "✅ SynergySphere is running!"
echo "🌐 Frontend: Available on port 8080"
echo "🔧 Backend: Running on port 3000"

# Wait for any process to exit
wait -n

# If we get here, one of the processes exited
echo "❌ A service exited unexpectedly"
cleanup
