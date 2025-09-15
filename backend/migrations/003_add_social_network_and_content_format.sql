-- Migration: Add social_network and content_format columns to ai_params table
-- Date: 2024-01-XX

-- Add new columns to ai_params table
ALTER TABLE ai_params 
ADD COLUMN social_network VARCHAR(50) DEFAULT 'Instagram' AFTER content_type,
ADD COLUMN content_format VARCHAR(50) DEFAULT 'Post' AFTER social_network;

-- Update existing records with default values
UPDATE ai_params 
SET social_network = 'Instagram', content_format = 'Post' 
WHERE social_network IS NULL OR content_format IS NULL;
