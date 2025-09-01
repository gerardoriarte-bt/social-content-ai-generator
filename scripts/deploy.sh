#!/bin/bash

# Deploy script for production
set -e

echo "🚀 Starting deployment..."

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
docker-compose -f docker-compose.prod.yml down || true

# Backup database
echo "💾 Creating database backup..."
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql
    echo -e "${GREEN}✅ Database backup created${NC}"
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show running containers
echo "📊 Running containers:"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "🌐 Your application should be available at: https://tu-dominio.com"
