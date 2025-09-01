#!/bin/bash

# Database backup script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/opt/backups"
PROJECT_DIR="/opt/social-content-ai"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

echo "💾 Starting database backup..."

# Create database backup
cd $PROJECT_DIR
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
    -u root \
    -p$MYSQL_ROOT_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    $MYSQL_DATABASE > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

echo -e "${GREEN}✅ Database backup created: $BACKUP_FILE${NC}"

# Clean up old backups
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️ Uploading backup to S3..."
    aws s3 cp $BACKUP_FILE s3://$AWS_S3_BUCKET/backups/
    echo -e "${GREEN}✅ Backup uploaded to S3${NC}"
fi

echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
