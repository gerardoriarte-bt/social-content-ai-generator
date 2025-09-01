#!/bin/bash

# Deploy script for t2.micro instance
set -e

echo "🚀 Starting deployment on t2.micro..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="social-content-ai"
BACKUP_DIR="/opt/backups"
LOG_DIR="/opt/logs"

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $LOG_DIR
sudo mkdir -p /opt/ssl

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.micro.yml down || true

# Clean up to free memory
echo "🧹 Cleaning up to free memory..."
docker system prune -f
docker volume prune -f

# Backup database (if exists)
echo "💾 Creating database backup..."
if [ -f "docker-compose.micro.yml" ]; then
    # Only backup if database exists
    if docker-compose -f docker-compose.micro.yml ps mysql | grep -q "Up"; then
        docker-compose -f docker-compose.micro.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
        echo -e "${GREEN}✅ Database backup created${NC}"
    fi
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and start containers (one by one to save memory)
echo "🔨 Building and starting containers..."

# Start MySQL first
echo "🐬 Starting MySQL..."
docker-compose -f docker-compose.micro.yml up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Start backend
echo "🔧 Starting Backend..."
docker-compose -f docker-compose.micro.yml up -d backend

# Wait for backend to be ready
echo "⏳ Waiting for Backend to be ready..."
sleep 20

# Start frontend
echo "🎨 Starting Frontend..."
docker-compose -f docker-compose.micro.yml up -d frontend

# Wait for frontend to be ready
echo "⏳ Waiting for Frontend to be ready..."
sleep 10

# Start nginx
echo "🌐 Starting Nginx..."
docker-compose -f docker-compose.micro.yml up -d nginx

# Wait for services to be ready
echo "⏳ Waiting for all services to be ready..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "Checking logs..."
    docker-compose -f docker-compose.micro.yml logs backend
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo "Checking logs..."
    docker-compose -f docker-compose.micro.yml logs frontend
    exit 1
fi

# Clean up old images to free space
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show running containers
echo "📊 Running containers:"
docker-compose -f docker-compose.micro.yml ps

# Show memory usage
echo "💾 Memory usage:"
free -h

echo -e "${GREEN}🎉 Deployment completed successfully on t2.micro!${NC}"
echo "🌐 Your application should be available at: http://$(curl -s ifconfig.me)"
echo "💡 Remember: t2.micro is small, so it might be a bit slow!"
