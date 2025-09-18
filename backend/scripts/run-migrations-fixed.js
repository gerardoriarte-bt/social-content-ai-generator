#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'social_content_user',
  password: process.env.DB_PASSWORD || 'social_content_password',
  database: process.env.DB_NAME || 'social_content_ai',
};

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Read and execute migration files
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      console.log(`🔄 Running migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      
      console.log(`✅ Migration ${file} completed successfully`);
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
