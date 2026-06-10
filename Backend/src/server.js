const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 4000;

pool.getConnection()
  .then(conn => {
    conn.release();
    console.log('✓ Conectado a MySQL');
    app.listen(PORT, () => console.log(`✓ Servidor en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('✗ Error de conexión a MySQL:', err.message);
    process.exit(1);
  });
