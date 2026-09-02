const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Uso: node import_db.js [usuario] [password] [host] [puerto]
const DB_USER = process.argv[2] || process.env.DB_USER || 'root';
const DB_PASSWORD = process.argv[3] || process.env.DB_PASSWORD || '';
const DB_HOST = process.argv[4] || process.env.DB_HOST || '169.58.241.118';
const DB_PORT = parseInt(process.argv[5] || process.env.DB_PORT || '3306', 10);

(async () => {
  console.log(`Conectando a MySQL en ${DB_HOST}:${DB_PORT} como ${DB_USER}...`);
  try {
    const conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
      connectTimeout: 10000,
    });

    console.log('✓ Conectado exitosamente al servidor MySQL.');

    const sqlFile = path.join(__dirname, 'dump_consultorio.sql');
    console.log(`Leyendo archivo de volcado: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Importando base de datos consultorio (esto puede tardar unos segundos)...');
    await conn.query(sql);

    console.log('✓ ¡Base de datos consultorio importada con éxito!');
    
    // Validar tablas creadas
    const [tables] = await conn.query('SHOW TABLES FROM consultorio;');
    console.log('Tablas en consultorio:', tables.map(t => Object.values(t)[0]));

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error al importar base de datos:', err.message);
    process.exit(1);
  }
})();
