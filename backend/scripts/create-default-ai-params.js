const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'social_content_ai',
  port: process.env.DB_PORT || 3306
};

async function createDefaultAIParams() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Get all business lines that don't have AI params
    const [businessLines] = await connection.execute(`
      SELECT bl.id, bl.name 
      FROM business_lines bl 
      LEFT JOIN ai_params ap ON bl.id = ap.business_line_id 
      WHERE ap.id IS NULL
    `);
    
    console.log(`Found ${businessLines.length} business lines without AI params`);
    
    if (businessLines.length === 0) {
      console.log('All business lines already have AI params');
      return;
    }
    
    // Create default AI params for each business line
    for (const businessLine of businessLines) {
      const aiParamsId = uuidv4();
      
      await connection.execute(`
        INSERT INTO ai_params (id, business_line_id, tone, character_type, target_audience, content_type, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        aiParamsId,
        businessLine.id,
        'Profesional y amigable',
        'Experto en la industria',
        'Clientes potenciales y existentes',
        'Posts informativos y promocionales'
      ]);
      
      console.log(`Created AI params for business line: ${businessLine.name}`);
    }
    
    console.log('✅ Successfully created default AI params for all business lines');
    
  } catch (error) {
    console.error('Error creating default AI params:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
createDefaultAIParams()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
