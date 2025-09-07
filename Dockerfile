FROM node:18-alpine

# Install system dependencies including curl for health checks
RUN apk add --no-cache nginx curl

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend
RUN cd frontend && npm run build

# Generate Prisma client
RUN cd backend && npx prisma generate

# Copy nginx configuration for Railway
COPY nginx.railway.conf /etc/nginx/nginx.conf

# Create startup script
COPY start-railway.sh /start.sh
RUN chmod +x /start.sh

# Expose port (Railway automatically detects this)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/start.sh"]
