const pool = require('../../config/database');

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT c.*,
      COUNT(DISTINCT u.id) AS usuarios_count,
      COUNT(DISTINCT p.id) AS pacientes_count
     FROM consultorios c
     LEFT JOIN usuarios u ON u.consultorio_id = c.id AND u.activo = 1
     LEFT JOIN pacientes p ON p.consultorio_id = c.id
     GROUP BY c.id
     ORDER BY c.nombre`
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM consultorios WHERE id=?', [id]);
  return rows[0];
};

const create = async ({ nombre, nit, direccion, telefono, ciudad, email }) => {
  const [r] = await pool.query(
    'INSERT INTO consultorios (nombre, nit, direccion, telefono, ciudad, email) VALUES (?,?,?,?,?,?)',
    [nombre, nit || null, direccion || null, telefono || null, ciudad || null, email || null]
  );
  return r.insertId;
};

const update = async (id, { nombre, nit, direccion, telefono, ciudad, email, activo }) => {
  await pool.query(
    'UPDATE consultorios SET nombre=?, nit=?, direccion=?, telefono=?, ciudad=?, email=?, activo=? WHERE id=?',
    [nombre, nit || null, direccion || null, telefono || null, ciudad || null, email || null, activo ?? 1, id]
  );
};

const remove = async (id) => {
  await pool.query('UPDATE consultorios SET activo=0 WHERE id=?', [id]);
};

module.exports = { getAll, getById, create, update, remove };
