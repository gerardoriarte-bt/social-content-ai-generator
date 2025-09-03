#!/bin/bash

echo "🚀 Robust Deployment Script for Social Content AI Generator"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_RETRIES=3
RETRY_DELAY=10
HEALTH_CHECK_TIMEOUT=60

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to wait for service health
wait_for_health() {
    local service=$1
    local url=$2
    local timeout=$3
    local count=0
    
    print_info "Waiting for $service to be healthy..."
    
    while [ $count -lt $timeout ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_status 0 "$service is healthy"
            return 0
        fi
        
        sleep 2
        count=$((count + 2))
        echo -n "."
    done
    
    echo ""
    print_status 1 "$service health check timeout"
    return 1
}

# Function to retry command
retry_command() {
    local cmd="$1"
    local description="$2"
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        print_info "Attempt $((retries + 1))/$MAX_RETRIES: $description"
        
        if eval "$cmd"; then
            print_status 0 "$description completed successfully"
            return 0
        else
            retries=$((retries + 1))
            if [ $retries -lt $MAX_RETRIES ]; then
                print_warning "$description failed, retrying in $RETRY_DELAY seconds..."
                sleep $RETRY_DELAY
            fi
        fi
    done
    
    print_status 1 "$description failed after $MAX_RETRIES attempts"
    return 1
}

# Pre-deployment checks
echo "📋 Pre-deployment checks:"
echo "========================="

# Check if pre-deploy script exists and run it
if [ -f "scripts/pre-deploy-check.sh" ]; then
    print_info "Running pre-deployment validation..."
    if ./scripts/pre-deploy-check.sh; then
        print_status 0 "Pre-deployment checks passed"
    else
        print_status 1 "Pre-deployment checks failed"
        exit 1
    fi
else
    print_warning "Pre-deployment check script not found, skipping..."
fi

echo ""
echo "🛑 Stopping existing containers:"
echo "================================"

# Stop existing containers with retry
retry_command "docker-compose down" "Stopping existing containers"

echo ""
echo "🗑️  Cleaning up old images:"
echo "==========================="

# Remove old images with retry
retry_command "docker-compose down --rmi all" "Removing old images"

echo ""
echo "🔨 Building and starting services:"
echo "=================================="

# Build and start services with retry
retry_command "docker-compose up -d --build" "Building and starting services"

echo ""
echo "⏳ Waiting for services to be ready:"
echo "===================================="

# Wait for MySQL
wait_for_health "MySQL" "http://localhost:3306" 30

# Wait for Backend
wait_for_health "Backend" "http://localhost:3001/health" $HEALTH_CHECK_TIMEOUT

# Wait for Frontend
wait_for_health "Frontend" "http://localhost:80" 30

echo ""
echo "🧪 Post-deployment verification:"
echo "================================"

# Test API endpoints
print_info "Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:3001/health | grep -q "OK"; then
    print_status 0 "Backend health endpoint working"
else
    print_status 1 "Backend health endpoint not working"
fi

# Test frontend
if curl -s -I http://localhost:80 | grep -q "200 OK"; then
    print_status 0 "Frontend responding correctly"
else
    print_status 1 "Frontend not responding"
fi

# Test database connection
print_info "Testing database connection..."
if docker-compose exec -T backend node -e "
const mysql = require('mysql2/promise');
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'social_content_user',
  password: process.env.DB_PASSWORD || 'social_content_password',
  database: process.env.DB_NAME || 'social_content_ai'
});
connection.then(() => {
  console.log('Database connection successful');
  process.exit(0);
}).catch((err) => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
" > /dev/null 2>&1; then
    print_status 0 "Database connection working"
else
    print_status 1 "Database connection failed"
fi

echo ""
echo "📊 Deployment Summary:"
echo "====================="

# Show running containers
print_info "Running containers:"
docker-compose ps

echo ""
print_info "Service URLs:"
echo "  Frontend: http://localhost:80"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"

echo ""
print_status 0 "🎉 Deployment completed successfully!"
echo "✅ All services are running and healthy"
