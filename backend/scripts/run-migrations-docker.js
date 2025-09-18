#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration for Docker
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-dev',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'social_content_user',
  password: process.env.DB_PASSWORD || 'social_content_password',
  database: process.env.DB_NAME || 'social_content_ai',
};

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    console.log(`📡 Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log(`🗄️  Database: ${dbConfig.database}`);
    
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
          try {
            await connection.execute(statement);
            console.log(`  ✅ Statement executed successfully`);
          } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
              console.log(`  ⚠️  Statement skipped (already exists): ${error.message}`);
            } else {
              throw error;
            }
          }
        }
      }
      
      console.log(`✅ Migration ${file} completed successfully`);
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Tip: Make sure the database is running and credentials are correct');
      console.error('💡 For Docker: docker-compose up mysql-dev');
    }
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
