#!/bin/bash

echo "🚀 Setting up Social Content AI Generator Development Environment"
echo "================================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your GEMINI_API_KEY"
    echo "   You can get it from: https://makersuite.google.com/app/apikey"
    read -p "Press Enter after you've updated the .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d mysql-dev

echo "⏳ Waiting for MySQL to be ready..."
sleep 10

echo "🔄 Running database migrations..."
cd backend
DB_HOST=mysql-dev DB_PORT=3306 node scripts/run-migrations-docker.js

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: docker-compose -f docker-compose.dev.yml up backend-dev"
echo "2. Start the frontend: docker-compose -f docker-compose.dev.yml up frontend-dev"
echo "3. Or start everything: docker-compose -f docker-compose.dev.yml up"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Database: localhost:3307"
