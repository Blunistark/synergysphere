@echo off
REM SynergySphere Docker Management Script for Windows

if "%1"=="dev" (
    echo 🚀 Starting SynergySphere in development mode...
    docker-compose -f docker-compose.dev.yml up --build
    goto :eof
)

if "%1"=="prod" (
    echo 🚀 Starting SynergySphere in production mode...
    docker-compose up --build
    goto :eof
)

if "%1"=="stop" (
    echo 🛑 Stopping SynergySphere...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    goto :eof
)

if "%1"=="clean" (
    echo 🧹 Cleaning up Docker resources...
    docker-compose down --volumes --rmi all
    docker-compose -f docker-compose.dev.yml down --volumes --rmi all
    docker system prune -f
    goto :eof
)

if "%1"=="logs" (
    echo 📋 Showing logs...
    if exist "docker-compose.dev.yml" (
        docker-compose -f docker-compose.dev.yml logs -f
    ) else (
        docker-compose logs -f
    )
    goto :eof
)

if "%1"=="reset-db" (
    echo 🗃️ Resetting database...
    docker-compose down postgres
    docker volume rm synergysphere-final_postgres_data 2>nul
    docker-compose up postgres -d
    timeout /t 5 /nobreak >nul
    docker-compose exec backend npx prisma migrate reset --force
    docker-compose exec backend npx prisma db seed
    goto :eof
)

echo SynergySphere Docker Management
echo Usage: %0 {dev^|prod^|stop^|clean^|logs^|reset-db}
echo.
echo Commands:
echo   dev      - Start in development mode with hot reload
echo   prod     - Start in production mode
echo   stop     - Stop all services
echo   clean    - Stop and remove all containers, volumes, and images
echo   logs     - Show service logs
echo   reset-db - Reset and reseed the database
