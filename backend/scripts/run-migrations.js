#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'donbosco3462',
  database: process.env.DB_NAME || 'social_content_ai',
  multipleStatements: true
};

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Starting database migrations...');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Check which migrations have been run
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const [executedMigrations] = await connection.execute(
      'SELECT filename FROM migrations ORDER BY executed_at'
    );
    
    const executedFilenames = executedMigrations.map(row => row.filename);
    console.log(`✅ ${executedFilenames.length} migrations already executed`);
    
    // Run pending migrations
    for (const filename of migrationFiles) {
      if (!executedFilenames.includes(filename)) {
        console.log(`🔄 Running migration: ${filename}`);
        
        const migrationPath = path.join(migrationsDir, filename);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        await connection.execute(migrationSQL);
        
        // Record migration as executed
        await connection.execute(
          'INSERT INTO migrations (filename) VALUES (?)',
          [filename]
        );
        
        console.log(`✅ Migration ${filename} completed`);
      } else {
        console.log(`⏭️  Migration ${filename} already executed`);
      }
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
