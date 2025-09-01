-- Social Content AI Generator Database Schema
-- This script initializes the database with all necessary tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS social_content_ai;
USE social_content_ai;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
);

-- Business lines table
CREATE TABLE IF NOT EXISTS business_lines (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_name (name)
);

-- Idea groups table
CREATE TABLE IF NOT EXISTS idea_groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    objective TEXT NOT NULL,
    company_id VARCHAR(36) NOT NULL,
    business_line_id VARCHAR(36) NOT NULL,
    company_name VARCHAR(255),
    business_line_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (business_line_id) REFERENCES business_lines(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_business_line_id (business_line_id),
    INDEX idx_created_at (created_at)
);

-- AI parameters table (for business lines)
CREATE TABLE IF NOT EXISTS ai_params (
    id VARCHAR(36) PRIMARY KEY,
    business_line_id VARCHAR(36) NOT NULL,
    tone VARCHAR(100) NOT NULL,
    character_type VARCHAR(100) NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_line_id) REFERENCES business_lines(id) ON DELETE CASCADE,
    INDEX idx_business_line_id (business_line_id)
);

-- Content ideas table
CREATE TABLE IF NOT EXISTS content_ideas (
    id VARCHAR(36) PRIMARY KEY,
    idea_group_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_group_id) REFERENCES idea_groups(id) ON DELETE CASCADE,
    INDEX idx_idea_group_id (idea_group_id),
    INDEX idx_created_at (created_at)
);

-- Hashtags table (many-to-many relationship with content ideas)
CREATE TABLE IF NOT EXISTS hashtags (
    id VARCHAR(36) PRIMARY KEY,
    content_idea_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_idea_id) REFERENCES content_ideas(id) ON DELETE CASCADE,
    INDEX idx_content_idea_id (content_idea_id),
    INDEX idx_tag (tag)
);

-- Insert some default users for testing
INSERT IGNORE INTO users (id, name, email, avatar_url) VALUES
('1', 'Alice Johnson', 'alice@example.com', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Alice'),
('2', 'Bob Williams', 'bob@example.com', 'https://api.dicebear.com/8.x/adventurer/svg?seed=Bob');

-- Create indexes for better performance
CREATE INDEX idx_companies_user_name ON companies(user_id, name);
CREATE INDEX idx_business_lines_company_name ON business_lines(company_id, name);
CREATE INDEX idx_idea_groups_company_business ON idea_groups(company_id, business_line_id);
CREATE INDEX idx_content_ideas_group_created ON content_ideas(idea_group_id, created_at);
