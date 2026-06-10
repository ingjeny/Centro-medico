const pool = require('../../config/database');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email]);
  return rows[0];
};

module.exports = { findByEmail };
