#!/bin/bash

# SSL Setup script with Let's Encrypt
set -e

echo "🔒 Setting up SSL with Let's Encrypt..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="tu-dominio.com"
EMAIL="tu-email@ejemplo.com"

# Check if domain is provided
if [ "$DOMAIN" = "tu-dominio.com" ]; then
    echo -e "${RED}❌ Please update the DOMAIN variable in this script${NC}"
    exit 1
fi

# Install certbot
echo "📦 Installing certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
echo "🛑 Stopping nginx..."
sudo systemctl stop nginx || true

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate for $DOMAIN..."
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Copy certificates to project directory
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem

# Update nginx configuration
echo "⚙️ Updating nginx configuration..."
sed -i "s/tu-dominio.com/$DOMAIN/g" nginx/conf.d/social-content.conf

# Start nginx
echo "🚀 Starting nginx..."
sudo systemctl start nginx

# Setup auto-renewal
echo "🔄 Setting up auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'docker-compose -f /opt/social-content-ai/docker-compose.prod.yml restart nginx'") | crontab -

echo -e "${GREEN}✅ SSL setup completed successfully!${NC}"
echo "🌐 Your site is now available at: https://$DOMAIN"
