#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐳 Building Social Content AI Generator with Docker${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY environment variable is not set.${NC}"
    echo -e "${YELLOW}   Please set it before building: export GEMINI_API_KEY=your-api-key${NC}"
    echo -e "${YELLOW}   Or create a .env file with GEMINI_API_KEY=your-api-key${NC}"
    exit 1
fi

# Build and run with Docker Compose
echo -e "${GREEN}📦 Building containers...${NC}"
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo -e "${GREEN}🚀 Starting services...${NC}"
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Services started successfully!${NC}"
        echo -e "${GREEN}🌐 Frontend: http://localhost${NC}"
        echo -e "${GREEN}🔗 Backend API: http://localhost:3001${NC}"
        echo -e "${GREEN}📊 Health Check: http://localhost:3001/health${NC}"
        echo -e "${YELLOW}📝 To view logs: docker-compose logs -f${NC}"
        echo -e "${YELLOW}🛑 To stop: docker-compose down${NC}"
    else
        echo -e "${RED}❌ Failed to start services${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
