#!/bin/bash

echo "🔍 Pre-deployment validation script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

echo "📋 Checking prerequisites..."

# Check Docker
if command_exists docker; then
    print_status 0 "Docker is installed"
else
    print_status 1 "Docker is not installed"
fi

# Check Docker Compose
if command_exists docker-compose; then
    print_status 0 "Docker Compose is installed"
else
    print_status 1 "Docker Compose is not installed"
fi

# Check if .env file exists
if [ -f .env ]; then
    print_status 0 ".env file exists"
else
    echo -e "${YELLOW}⚠️  .env file not found - using defaults${NC}"
fi

echo ""
echo "🧪 Running local tests..."

# Test backend build
echo "🔨 Testing backend build..."
if docker-compose build backend > /dev/null 2>&1; then
    print_status 0 "Backend builds successfully"
else
    print_status 1 "Backend build failed"
fi

# Test frontend build
echo "🔨 Testing frontend build..."
if docker-compose build frontend > /dev/null 2>&1; then
    print_status 0 "Frontend builds successfully"
else
    print_status 1 "Frontend build failed"
fi

echo ""
echo "🗄️  Testing database migrations..."

# Start MySQL only
docker-compose up -d mysql
sleep 10

# Test migrations
if docker-compose run --rm backend node scripts/run-migrations.js > /dev/null 2>&1; then
    print_status 0 "Database migrations work correctly"
else
    print_status 1 "Database migrations failed"
fi

# Cleanup
docker-compose down

echo ""
echo "🌐 Testing API endpoints..."

# Start services
docker-compose up -d
sleep 30

# Test health endpoint
if curl -s http://localhost:3001/health | grep -q "OK"; then
    print_status 0 "Backend health check passes"
else
    print_status 1 "Backend health check fails"
fi

# Test frontend
if curl -s -I http://localhost:80 | grep -q "200 OK"; then
    print_status 0 "Frontend responds correctly"
else
    print_status 1 "Frontend not responding"
fi

# Cleanup
docker-compose down

echo ""
echo -e "${GREEN}🎉 All pre-deployment checks passed!${NC}"
echo "✅ Ready for deployment"
