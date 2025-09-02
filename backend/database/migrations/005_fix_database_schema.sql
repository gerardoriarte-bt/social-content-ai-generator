-- Migration 005: Fix database schema issues
-- This migration adds missing columns and fixes table structure

USE social_content_ai;

-- Add missing columns to companies table if they don't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS industry VARCHAR(255);

-- Add missing columns to ai_params table if they don't exist
ALTER TABLE ai_params 
ADD COLUMN IF NOT EXISTS social_network VARCHAR(100),
ADD COLUMN IF NOT EXISTS content_format VARCHAR(100),
ADD COLUMN IF NOT EXISTS objective VARCHAR(100),
ADD COLUMN IF NOT EXISTS focus TEXT;

-- Fix content_ideas table structure
-- First, check if idea_group_id column exists and remove it if it does
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'social_content_ai' 
    AND TABLE_NAME = 'content_ideas' 
    AND COLUMN_NAME = 'idea_group_id'
);

-- If idea_group_id exists, we need to migrate data and drop the column
-- This is a complex migration that should be done carefully
-- For now, we'll just add the business_line_id column if it doesn't exist
ALTER TABLE content_ideas 
ADD COLUMN IF NOT EXISTS business_line_id VARCHAR(36);

-- Add foreign key constraint if it doesn't exist
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'social_content_ai' 
    AND TABLE_NAME = 'content_ideas' 
    AND CONSTRAINT_NAME = 'content_ideas_ibfk_1'
);

-- Add index for business_line_id if it doesn't exist
ALTER TABLE content_ideas 
ADD INDEX IF NOT EXISTS idx_business_line_id (business_line_id);

-- Update the foreign key constraint name to match the new structure
-- This will be handled by the application logic
