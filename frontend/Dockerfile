FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install bun
RUN npm install -g bun

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Use nginx to serve the built application
FROM nginx:alpine

# Copy built application from previous stage
COPY --from=0 /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
