#!/bin/bash

# Production Deployment Script for SynergySphere
set -e

echo "🚀 Starting SynergySphere Production Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production environment variables."
    exit 1
fi

# Load environment variables
source .env.production

echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🗄️  Setting up database..."
docker-compose -f docker-compose.prod.yml up -d postgres
sleep 10

echo "🚀 Starting all services..."
docker-compose -f docker-compose.prod.yml up -d

echo "🔍 Checking service health..."
sleep 15

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Your application should be available at:"
    echo "   Frontend: http://localhost"
    echo "   Backend API: http://localhost:3000"
    echo ""
    echo "📋 To view logs:"
    echo "   docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "   docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
fi
