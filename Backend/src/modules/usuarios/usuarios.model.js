const pool = require('../../config/database');

const getAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, especialidad, firma_path, activo, created_at FROM usuarios ORDER BY nombre'
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, especialidad, firma_path, activo FROM usuarios WHERE id = ?', [id]
  );
  return rows[0];
};

const getDoctores = async () => {
  const [rows] = await pool.query(
    "SELECT id, nombre, especialidad, firma_path FROM usuarios WHERE rol IN ('doctor','admin') AND activo = 1"
  );
  return rows;
};

const create = async ({ nombre, email, password, rol, especialidad }) => {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol, especialidad) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, password, rol, especialidad || null]
  );
  return result.insertId;
};

const update = async (id, { nombre, email, rol, especialidad, activo }) => {
  await pool.query(
    'UPDATE usuarios SET nombre=?, email=?, rol=?, especialidad=?, activo=? WHERE id=?',
    [nombre, email, rol, especialidad || null, activo, id]
  );
};

const updatePassword = async (id, password) => {
  await pool.query('UPDATE usuarios SET password=? WHERE id=?', [password, id]);
};

const updateFirma = async (id, firma_path) => {
  await pool.query('UPDATE usuarios SET firma_path=? WHERE id=?', [firma_path, id]);
};

const remove = async (id) => {
  await pool.query('UPDATE usuarios SET activo=0 WHERE id=?', [id]);
};

module.exports = { getAll, getById, getDoctores, create, update, updatePassword, updateFirma, remove };
