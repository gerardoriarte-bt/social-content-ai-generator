import bcrypt from 'bcrypt';

async function createDemoUser() {
  try {
    // Generate hash for password "demo123"
    const password = 'demo123';
    const hash = await bcrypt.hash(password, 12);
    
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // SQL to insert user
    const sql = `INSERT INTO users (id, name, email, password) VALUES ('demo-user-123', 'Demo User', 'demo@example.com', '${hash}') ON DUPLICATE KEY UPDATE password = '${hash}';`;
    
    console.log('\nSQL Command:');
    console.log(sql);
  } catch (error) {
    console.error('Error:', error);
  }
}

createDemoUser();
