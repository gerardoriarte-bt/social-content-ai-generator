-- Migration: Add platform field to content_ideas table
-- Date: 2024-01-XX
-- Description: Adds the missing platform field to content_ideas table

USE social_content_ai;

-- Add platform field to content_ideas table
ALTER TABLE content_ideas 
ADD COLUMN platform VARCHAR(100) NOT NULL DEFAULT 'Instagram';

-- Add index for platform field
CREATE INDEX idx_content_ideas_platform ON content_ideas(platform);

-- Update existing records to have a default platform if they don't have one
UPDATE content_ideas 
SET platform = 'Instagram' 
WHERE platform IS NULL OR platform = '';
