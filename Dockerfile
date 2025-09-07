FROM node:18-alpine

# Install system dependencies including curl for health checks
RUN apk add --no-cache nginx curl

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies (including dev dependencies for build)
RUN cd frontend && npm ci
RUN cd backend && npm ci --only=production

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend (now that we have all dependencies including Vite)
RUN cd frontend && npm run build

# Remove frontend dev dependencies after build to reduce image size
RUN cd frontend && npm prune --production

# Generate Prisma client
RUN cd backend && npx prisma generate

# Copy nginx configuration for Railway
COPY nginx.railway.conf /etc/nginx/nginx.conf

# Create startup script and make it executable
COPY start-railway.sh /start.sh
RUN chmod +x /start.sh && \
    # Test script syntax
    bash -n /start.sh && \
    echo "✅ Startup script syntax is valid"

# Expose port (Railway automatically detects this)
EXPOSE 8080

# Health check - test nginx directly
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run the startup script
CMD ["/start.sh"]
