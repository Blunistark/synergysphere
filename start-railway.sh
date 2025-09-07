#!/bin/sh
set -e

echo "🚀 Starting SynergySphere on Railway..."
echo "📊 Environment variables check:"
echo "   NODE_ENV: ${NODE_ENV:-'not set'}"
echo "   PORT: ${PORT:-'not set'}"
echo "   DATABASE_URL: ${DATABASE_URL:+*set*}"

# Test basic connectivity
echo "🔍 Basic system check..."
curl --version || echo "⚠️  curl not available"
node --version || echo "⚠️  node not available"
npm --version || echo "⚠️  npm not available"

# Kill any existing processes on ports 8080 and 3000
echo "🧹 Cleaning up any existing processes..."
pkill -f nginx || true
pkill -f "node.*server.js" || true
sleep 2

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

# Start backend in background on port 3000
echo "🔧 Starting backend server on port 3000..."
cd /app/backend
BACKEND_PORT=3000 npm start &
BACKEND_PID=$!

# Wait for backend to be ready with retries
echo "⏳ Waiting for backend to be ready..."
i=1
while [ $i -le 30 ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start after 60 seconds"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    echo "⏳ Attempt $i/30: Backend not ready, waiting 2 seconds..."
    sleep 2
    i=$((i + 1))
done

# Start nginx in foreground on port 8080
echo "🌐 Starting nginx reverse proxy on port 8080..."
nginx -t && echo "✅ Nginx config is valid" || {
    echo "❌ Nginx config is invalid"
    cat /etc/nginx/nginx.conf
    exit 1
}

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    pkill -f nginx || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "✅ SynergySphere is running!"
echo "🌐 Frontend: Available on port 8080"
echo "🔧 Backend: Running on port 3000"
echo "💚 Health check: Available at /health"

# Start nginx in foreground (this keeps the container running)
exec nginx -g "daemon off;"
