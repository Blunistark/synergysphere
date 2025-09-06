#!/bin/bash

# SynergySphere Docker Management Script

case "$1" in
  "dev")
    echo "🚀 Starting SynergySphere in development mode..."
    docker-compose -f docker-compose.dev.yml up --build
    ;;
  "prod")
    echo "🚀 Starting SynergySphere in production mode..."
    docker-compose up --build
    ;;
  "stop")
    echo "🛑 Stopping SynergySphere..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    ;;
  "clean")
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down --volumes --rmi all
    docker-compose -f docker-compose.dev.yml down --volumes --rmi all
    docker system prune -f
    ;;
  "logs")
    echo "📋 Showing logs..."
    if [ -f "docker-compose.dev.yml" ]; then
      docker-compose -f docker-compose.dev.yml logs -f
    else
      docker-compose logs -f
    fi
    ;;
  "reset-db")
    echo "🗃️ Resetting database..."
    docker-compose down postgres
    docker volume rm synergysphere-final_postgres_data 2>/dev/null || true
    docker-compose up postgres -d
    sleep 5
    docker-compose exec backend npx prisma migrate reset --force
    docker-compose exec backend npx prisma db seed
    ;;
  *)
    echo "SynergySphere Docker Management"
    echo "Usage: $0 {dev|prod|stop|clean|logs|reset-db}"
    echo ""
    echo "Commands:"
    echo "  dev      - Start in development mode with hot reload"
    echo "  prod     - Start in production mode"
    echo "  stop     - Stop all services"
    echo "  clean    - Stop and remove all containers, volumes, and images"
    echo "  logs     - Show service logs"
    echo "  reset-db - Reset and reseed the database"
    exit 1
    ;;
esac
