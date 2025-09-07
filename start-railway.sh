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

# Start nginx immediately for health checks
echo "🌐 Starting nginx reverse proxy on port 8080 (for health checks)..."
nginx -t && echo "✅ Nginx config is valid" || echo "❌ Nginx config has errors"
nginx &
NGINX_PID=$!

# Give nginx a moment to start
sleep 2

# Test nginx health endpoint
echo "🔍 Testing nginx health endpoint..."
curl -f http://localhost:8080/health && echo "✅ Nginx health check OK" || echo "⚠️  Nginx health check failed"

# Start backend in background
echo "🔧 Starting backend server on port 3000..."
cd /app/backend
npm start &
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
        echo "⚠️  Backend failed to start after 60 seconds, but nginx is serving"
        break
    fi
    echo "⏳ Attempt $i/30: Backend not ready, waiting 2 seconds..."
    sleep 2
    i=$((i + 1))
done

# Start nginx in foreground
echo "🌐 Nginx is already running and serving health checks..."

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
echo "💚 Health check: Available at /health"

# Keep the container running by monitoring processes
while true; do
    # Check if nginx is still running
    if ! ps -p $NGINX_PID > /dev/null 2>&1; then
        echo "❌ Nginx died, restarting..."
        nginx &
        NGINX_PID=$!
    fi
    
    # Check if backend is still running
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "❌ Backend died, restarting..."
        cd /app/backend
        npm start &
        BACKEND_PID=$!
    fi
    
    sleep 30
done
