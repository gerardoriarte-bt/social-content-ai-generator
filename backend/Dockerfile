# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Install curl for health checks and mysql client
RUN apk add --no-cache curl mysql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Make start script executable
RUN chmod +x scripts/start.sh

# Start the application with migrations
CMD ["sh", "-c", "echo '🚀 Starting Social Content AI Backend...' && echo '🔄 Running database migrations...' && node scripts/run-migrations.js && echo '🚀 Starting application...' && npm start"]
