const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');
require('dotenv').config();

// ← Cambia estos datos
const nombre = 'Dr. Juan Pérez';
const email = 'admin@gmail.com';
const password = '1234';
const rol = 'admin'; // 'admin' | 'doctor' | 'secretaria'

(async () => {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hash, rol]
  );
  console.log(`✓ Usuario creado: ${email} / ${password}`);
  process.exit(0);
})().catch(err => { console.error(err.message); process.exit(1); });
