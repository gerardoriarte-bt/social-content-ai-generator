#!/usr/bin/env node

/**
 * Migration Helper Script
 * Provides utilities for creating and managing database migrations
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// MySQL-compatible migration templates
const migrationTemplates = {
    addColumn: (table, column, type, nullable = true) => {
        const nullableStr = nullable ? '' : ' NOT NULL';
        return `-- Add ${column} column to ${table} table
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'social_content_ai' 
    AND TABLE_NAME = '${table}' 
    AND COLUMN_NAME = '${column}'
);

SET @sql = IF(@column_exists = 0, 'ALTER TABLE ${table} ADD COLUMN ${column} ${type}${nullableStr}', 'SELECT "Column ${column} already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;`;
    },

    addIndex: (table, indexName, columns) => {
        return `-- Add ${indexName} index to ${table} table
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'social_content_ai' 
    AND TABLE_NAME = '${table}' 
    AND INDEX_NAME = '${indexName}'
);

SET @sql = IF(@index_exists = 0, 'ALTER TABLE ${table} ADD INDEX ${indexName} (${columns})', 'SELECT "Index ${indexName} already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;`;
    },

    addForeignKey: (table, constraintName, column, refTable, refColumn) => {
        return `-- Add ${constraintName} foreign key constraint
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'social_content_ai' 
    AND TABLE_NAME = '${table}' 
    AND CONSTRAINT_NAME = '${constraintName}'
);

SET @sql = IF(@constraint_exists = 0, 'ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${column}) REFERENCES ${refTable}(${refColumn})', 'SELECT "Constraint ${constraintName} already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;`;
    }
};

function createMigration(migrationName, operations) {
    const migrationsDir = path.join(__dirname, '../backend/database/migrations');
    
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Get next migration number
    const existingMigrations = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    
    const nextNumber = existingMigrations.length + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    
    const filename = `${paddedNumber}_${migrationName}.sql`;
    const filepath = path.join(migrationsDir, filename);
    
    // Create migration content
    let content = `-- Migration ${paddedNumber}: ${migrationName}
-- Generated on ${new Date().toISOString()}

USE social_content_ai;

`;
    
    // Add operations
    for (const operation of operations) {
        content += operation + '\n\n';
    }
    
    // Write migration file
    fs.writeFileSync(filepath, content);
    
    log(`✅ Created migration: ${filename}`, 'green');
    log(`📁 Location: ${filepath}`, 'blue');
    
    return filepath;
}

function validateMigration(migrationPath) {
    log(`🔍 Validating migration: ${path.basename(migrationPath)}`, 'blue');
    
    const content = fs.readFileSync(migrationPath, 'utf8');
    const issues = [];
    
    // Check for common issues
    if (content.includes('ADD COLUMN IF NOT EXISTS')) {
        issues.push('Uses "ADD COLUMN IF NOT EXISTS" which is not supported in MySQL');
    }
    
    if (content.includes('ADD INDEX IF NOT EXISTS')) {
        issues.push('Uses "ADD INDEX IF NOT EXISTS" which is not supported in MySQL');
    }
    
    if (content.includes('ADD CONSTRAINT IF NOT EXISTS')) {
        issues.push('Uses "ADD CONSTRAINT IF NOT EXISTS" which is not supported in MySQL');
    }
    
    if (issues.length > 0) {
        log('❌ Migration validation failed:', 'red');
        for (const issue of issues) {
            log(`   • ${issue}`, 'yellow');
        }
        return false;
    } else {
        log('✅ Migration validation passed', 'green');
        return true;
    }
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            if (args.length < 2) {
                log('Usage: node migration-helper.js create <migration-name>', 'red');
                process.exit(1);
            }
            
            const migrationName = args[1];
            const operations = [];
            
            // Example operations - in real usage, these would be provided as arguments
            if (migrationName.includes('add-columns')) {
                operations.push(migrationTemplates.addColumn('companies', 'description', 'TEXT'));
                operations.push(migrationTemplates.addColumn('companies', 'industry', 'VARCHAR(255)'));
            }
            
            createMigration(migrationName, operations);
            break;
            
        case 'validate':
            const migrationsDir = path.join(__dirname, '../backend/database/migrations');
            const migrationFiles = fs.readdirSync(migrationsDir)
                .filter(file => file.endsWith('.sql'))
                .sort();
            
            let allValid = true;
            
            for (const file of migrationFiles) {
                const filepath = path.join(migrationsDir, file);
                if (!validateMigration(filepath)) {
                    allValid = false;
                }
            }
            
            if (allValid) {
                log('🎉 All migrations are valid!', 'green');
                process.exit(0);
            } else {
                log('❌ Some migrations have issues', 'red');
                process.exit(1);
            }
            break;
            
        default:
            log('Migration Helper Script', 'blue');
            log('======================', 'blue');
            log('Usage:', 'yellow');
            log('  node migration-helper.js create <migration-name>', 'blue');
            log('  node migration-helper.js validate', 'blue');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = { createMigration, validateMigration, migrationTemplates };
