const pool = require('../../config/database');

// ── Especialidades ──────────────────────────────────────────────────────────

const getAll = async () => {
  const [rows] = await pool.query(
    `SELECT e.*, COUNT(u.id) AS doctores_count
     FROM especialidades e
     LEFT JOIN usuarios u ON u.especialidad_id = e.id AND u.activo = 1
     GROUP BY e.id
     ORDER BY e.nombre`
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM especialidades WHERE id=?', [id]);
  return rows[0];
};

const create = async ({ nombre, descripcion, color }) => {
  const [r] = await pool.query(
    'INSERT INTO especialidades (nombre, descripcion, color) VALUES (?,?,?)',
    [nombre, descripcion || null, color || '#6366f1']
  );
  return r.insertId;
};

const update = async (id, { nombre, descripcion, color, activo }) => {
  await pool.query(
    'UPDATE especialidades SET nombre=?, descripcion=?, color=?, activo=? WHERE id=?',
    [nombre, descripcion || null, color || '#6366f1', activo ?? 1, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM especialidades WHERE id=?', [id]);
};

// ── Campos ──────────────────────────────────────────────────────────────────

const getCampos = async (especialidad_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM campos_especialidad
     WHERE especialidad_id=?
     ORDER BY orden, id`,
    [especialidad_id]
  );
  return rows.map(r => ({
    ...r,
    opciones: r.opciones ? JSON.parse(r.opciones) : null,
  }));
};

const createCampo = async ({ especialidad_id, nombre, etiqueta, tipo, opciones, unidad, requerido, seccion, orden }) => {
  const [r] = await pool.query(
    `INSERT INTO campos_especialidad
      (especialidad_id, nombre, etiqueta, tipo, opciones, unidad, requerido, seccion, orden)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      especialidad_id, nombre, etiqueta, tipo || 'texto',
      opciones ? JSON.stringify(opciones) : null,
      unidad || null, requerido ? 1 : 0,
      seccion || 'Datos específicos', orden || 0,
    ]
  );
  return r.insertId;
};

const updateCampo = async (id, { nombre, etiqueta, tipo, opciones, unidad, requerido, seccion, orden }) => {
  await pool.query(
    `UPDATE campos_especialidad
     SET nombre=?, etiqueta=?, tipo=?, opciones=?, unidad=?, requerido=?, seccion=?, orden=?
     WHERE id=?`,
    [
      nombre, etiqueta, tipo || 'texto',
      opciones ? JSON.stringify(opciones) : null,
      unidad || null, requerido ? 1 : 0,
      seccion || 'Datos específicos', orden || 0, id,
    ]
  );
};

const deleteCampo = async (id) => {
  await pool.query('DELETE FROM campos_especialidad WHERE id=?', [id]);
};

const reorderCampos = async (ids) => {
  for (let i = 0; i < ids.length; i++) {
    await pool.query('UPDATE campos_especialidad SET orden=? WHERE id=?', [i, ids[i]]);
  }
};

module.exports = {
  getAll, getById, create, update, remove,
  getCampos, createCampo, updateCampo, deleteCampo, reorderCampos,
};
