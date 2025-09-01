#!/bin/bash

# Monitoring script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📊 System Monitoring Report"
echo "=========================="

# Check disk space
echo "💾 Disk Usage:"
df -h | grep -E '^/dev/'

# Check memory usage
echo -e "\n🧠 Memory Usage:"
free -h

# Check Docker containers
echo -e "\n🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check application health
echo -e "\n🏥 Application Health:"
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend: Healthy${NC}"
else
    echo -e "${RED}❌ Backend: Unhealthy${NC}"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: Healthy${NC}"
else
    echo -e "${RED}❌ Frontend: Unhealthy${NC}"
fi

# Check SSL certificate
echo -e "\n🔒 SSL Certificate:"
if [ -f "/opt/ssl/fullchain.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in /opt/ssl/fullchain.pem | cut -d= -f2)
    echo "Expires: $EXPIRY"
    
    # Check if certificate expires in less than 30 days
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
        echo -e "${YELLOW}⚠️ Certificate expires in $DAYS_UNTIL_EXPIRY days${NC}"
    else
        echo -e "${GREEN}✅ Certificate is valid for $DAYS_UNTIL_EXPIRY days${NC}"
    fi
else
    echo -e "${RED}❌ SSL certificate not found${NC}"
fi

# Check recent logs for errors
echo -e "\n📝 Recent Errors (last 10):"
docker-compose -f docker-compose.prod.yml logs --tail=10 2>&1 | grep -i error || echo "No recent errors found"

echo -e "\n🎉 Monitoring completed!"
