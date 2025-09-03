-- Migration 005: Fix database schema issues
-- This migration adds missing columns and fixes table structure

USE social_content_ai;

-- Add missing columns to companies table
ALTER TABLE companies ADD COLUMN description TEXT;
ALTER TABLE companies ADD COLUMN industry VARCHAR(255);

-- Add missing columns to ai_params table
ALTER TABLE ai_params ADD COLUMN social_network VARCHAR(100);
ALTER TABLE ai_params ADD COLUMN content_format VARCHAR(100);
ALTER TABLE ai_params ADD COLUMN objective VARCHAR(100);
ALTER TABLE ai_params ADD COLUMN focus TEXT;

-- Add business_line_id column to content_ideas table
ALTER TABLE content_ideas ADD COLUMN business_line_id VARCHAR(36);

-- Add index for business_line_id
ALTER TABLE content_ideas ADD INDEX idx_business_line_id (business_line_id);
