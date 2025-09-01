-- Migration: Add objective and focus columns to ai_params table
-- Date: 2024-01-XX

-- Add new columns to ai_params table
ALTER TABLE ai_params 
ADD COLUMN objective VARCHAR(50) DEFAULT 'Awareness' AFTER content_format,
ADD COLUMN focus VARCHAR(200) DEFAULT '' AFTER objective;

-- Update existing records with default values
UPDATE ai_params 
SET objective = 'Awareness', focus = '' 
WHERE objective IS NULL OR focus IS NULL;
