#!/bin/bash

# Deploy Fixed Version Script
# This script deploys the application with all the fixes applied

set -e

echo "🚀 Deploying Social Content AI Generator with fixes..."

# Check if we're in the right directory
if [ ! -f "docker-compose.micro.yml" ]; then
    echo "❌ Error: docker-compose.micro.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found. Please create it with the required variables."
    exit 1
fi

echo "📋 Pre-deployment checks:"
echo "✅ Docker Compose file found"
echo "✅ Environment file found"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.micro.yml down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker-compose -f docker-compose.micro.yml down --rmi all

# Build and start with environment file
echo "🔨 Building and starting containers with fixes..."
docker-compose -f docker-compose.micro.yml --env-file .env.production up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check container status
echo "📊 Container status:"
docker-compose -f docker-compose.micro.yml ps

# Check backend logs
echo "📋 Backend logs (last 20 lines):"
docker logs --tail 20 social-content-backend-micro

# Test backend health
echo "🏥 Testing backend health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "📋 Full backend logs:"
    docker logs social-content-backend-micro
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo "🎉 Deployment completed!"
echo "📱 Frontend: http://$(curl -s ifconfig.me):80"
echo "🔧 Backend: http://$(curl -s ifconfig.me):3001"
echo "📊 Health: http://$(curl -s ifconfig.me):3001/health"
