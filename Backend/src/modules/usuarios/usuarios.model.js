const pool = require('../../config/database');
const { getScope } = require('../../helpers/scope');

const getAll = async (user) => {
  const cid = getScope(user);
  const [rows] = cid !== null
    ? await pool.query(
        `SELECT u.id, u.nombre, u.email, u.rol, u.especialidad, u.especialidad_id,
                u.firma_path, u.activo, u.consultorio_id, u.created_at,
                e.nombre AS especialidad_nombre, c.nombre AS consultorio_nombre
         FROM usuarios u
         LEFT JOIN especialidades e ON u.especialidad_id = e.id
         LEFT JOIN consultorios c ON u.consultorio_id = c.id
         WHERE u.consultorio_id = ?
         ORDER BY u.nombre`,
        [cid]
      )
    : await pool.query(
        `SELECT u.id, u.nombre, u.email, u.rol, u.especialidad, u.especialidad_id,
                u.firma_path, u.activo, u.consultorio_id, u.created_at,
                e.nombre AS especialidad_nombre, c.nombre AS consultorio_nombre
         FROM usuarios u
         LEFT JOIN especialidades e ON u.especialidad_id = e.id
         LEFT JOIN consultorios c ON u.consultorio_id = c.id
         ORDER BY u.nombre`
      );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.rol, u.especialidad, u.especialidad_id,
            u.firma_path, u.activo, u.consultorio_id,
            e.nombre AS especialidad_nombre, c.nombre AS consultorio_nombre
     FROM usuarios u
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     LEFT JOIN consultorios c ON u.consultorio_id = c.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0];
};

const getDoctores = async (user) => {
  const cid = getScope(user);
  const [rows] = cid !== null
    ? await pool.query(
        `SELECT u.id, u.nombre, u.especialidad, u.especialidad_id, u.firma_path,
                e.nombre AS especialidad_nombre
         FROM usuarios u
         LEFT JOIN especialidades e ON u.especialidad_id = e.id
         WHERE u.rol IN ('doctor','admin') AND u.activo = 1 AND u.consultorio_id = ?`,
        [cid]
      )
    : await pool.query(
        `SELECT u.id, u.nombre, u.especialidad, u.especialidad_id, u.firma_path,
                e.nombre AS especialidad_nombre
         FROM usuarios u
         LEFT JOIN especialidades e ON u.especialidad_id = e.id
         WHERE u.rol IN ('doctor','admin') AND u.activo = 1`
      );
  return rows;
};

const create = async ({ nombre, email, password, rol, especialidad, especialidad_id, consultorio_id }) => {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password, rol, especialidad, especialidad_id, consultorio_id) VALUES (?,?,?,?,?,?,?)',
    [nombre, email, password, rol, especialidad || null, especialidad_id || null, consultorio_id || null]
  );
  return result.insertId;
};

const update = async (id, { nombre, email, rol, especialidad, especialidad_id, consultorio_id, activo }) => {
  await pool.query(
    'UPDATE usuarios SET nombre=?, email=?, rol=?, especialidad=?, especialidad_id=?, consultorio_id=?, activo=? WHERE id=?',
    [nombre, email, rol, especialidad || null, especialidad_id || null, consultorio_id || null, activo ?? 1, id]
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
