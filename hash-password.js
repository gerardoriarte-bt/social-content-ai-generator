import bcrypt from 'bcrypt';

async function hashPassword() {
  const password = 'test123';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

hashPassword().catch(console.error);
