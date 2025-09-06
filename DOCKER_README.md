# SynergySphere Docker Setup

This guide helps you run SynergySphere using Docker containers.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Development Mode (Recommended for development)

```bash
# Windows
docker.bat dev

# Linux/Mac
./docker.sh dev
```

This will start:
- Frontend on http://localhost:8080
- Backend API on http://localhost:3000
- PostgreSQL database on localhost:5432

### Production Mode

```bash
# Windows
docker.bat prod

# Linux/Mac
./docker.sh prod
```

## Available Commands

### Windows (docker.bat)
```cmd
docker.bat dev      # Start in development mode
docker.bat prod     # Start in production mode  
docker.bat stop     # Stop all services
docker.bat clean    # Clean up all Docker resources
docker.bat logs     # Show service logs
docker.bat reset-db # Reset and reseed database
```

### Linux/Mac (docker.sh)
```bash
./docker.sh dev      # Start in development mode
./docker.sh prod     # Start in production mode
./docker.sh stop     # Stop all services
./docker.sh clean    # Clean up all Docker resources
./docker.sh logs     # Show service logs
./docker.sh reset-db # Reset and reseed database
```

## Manual Docker Commands

If you prefer manual control:

### Development
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
docker-compose up --build
```

### Stop Services
```bash
docker-compose down
```

## Environment Configuration

### Backend Environment Variables
- `NODE_ENV`: Set to `development` or `production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Frontend URL for CORS

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Backend API URL

## Database Setup

The database will be automatically initialized when you first run the containers. If you need to reset the database:

```bash
# Windows
docker.bat reset-db

# Linux/Mac  
./docker.sh reset-db
```

## Troubleshooting

### Port Conflicts
If ports 3000, 8080, or 5432 are already in use, modify the port mappings in the docker-compose files.

### Container Logs
To view logs for debugging:
```bash
# Windows
docker.bat logs

# Linux/Mac
./docker.sh logs
```

### Clean Reset
To completely reset the environment:
```bash
# Windows
docker.bat clean

# Linux/Mac
./docker.sh clean
```

## Development Workflow

1. Make changes to your code
2. The development containers will automatically reload
3. Frontend changes trigger Vite hot reload
4. Backend changes trigger nodemon restart

## File Structure

```
SynergySphere-final/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── docker.sh                   # Linux/Mac management script
├── docker.bat                  # Windows management script
├── frontend/
│   ├── Dockerfile              # Production frontend image
│   ├── Dockerfile.dev          # Development frontend image
│   ├── nginx.conf              # Nginx configuration
│   └── ...
└── backend/
    ├── Dockerfile              # Backend image
    └── ...
```

## Default Credentials

- Database: `synergysphere`
- Username: `synergy_user`  
- Password: `synergy_pass`

**Important**: Change these credentials for production use!
