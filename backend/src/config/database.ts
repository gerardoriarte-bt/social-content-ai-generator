import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'social_content_user',
  password: process.env.DB_PASSWORD || 'social_content_password',
  database: process.env.DB_NAME || 'social_content_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection first
    await testConnection();
    
    // The tables will be created automatically by the init.sql script
    // when the MySQL container starts, so we just need to verify they exist
    const [rows] = await pool.execute('SHOW TABLES');
    console.log('📊 Database tables:', (rows as any[]).map((row: any) => Object.values(row)[0]));
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};
