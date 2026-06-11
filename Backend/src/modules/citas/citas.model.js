const pool = require('../../config/database');
const { getScope } = require('../../helpers/scope');

const scopeAnd = (user, alias, vals) => {
  const cid = getScope(user);
  if (cid === null) return '';
  vals.push(cid);
  return ` AND ${alias}.consultorio_id = ?`;
};

const getByMonth = async (year, month, user) => {
  const vals = [year, month];
  const extra = scopeAnd(user, 'c', vals);
  const [rows] = await pool.query(
    `SELECT c.*,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      p.cedula AS paciente_cedula,
      u.nombre AS doctor_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     WHERE YEAR(c.fecha) = ? AND MONTH(c.fecha) = ?${extra}
     ORDER BY c.fecha, c.hora`,
    vals
  );
  return rows;
};

const getByDate = async (fecha, user) => {
  const vals = [fecha];
  const extra = scopeAnd(user, 'c', vals);
  const [rows] = await pool.query(
    `SELECT c.*,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      p.cedula AS paciente_cedula,
      u.nombre AS doctor_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     WHERE c.fecha = ?${extra}
     ORDER BY c.hora`,
    vals
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT c.*,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      u.nombre AS doctor_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0];
};

const create = async ({ paciente_id, doctor_id, fecha, hora, motivo, notas, tipo_pago }, user) => {
  const cid = user.consultorio_id || null;
  const [result] = await pool.query(
    'INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo, notas, tipo_pago, consultorio_id) VALUES (?,?,?,?,?,?,?,?)',
    [paciente_id, doctor_id, fecha, hora, motivo || null, notas || null, tipo_pago || 'pendiente_pago', cid]
  );
  return result.insertId;
};

const update = async (id, { paciente_id, doctor_id, fecha, hora, motivo, estado, notas, tipo_pago }) => {
  await pool.query(
    'UPDATE citas SET paciente_id=?, doctor_id=?, fecha=?, hora=?, motivo=?, estado=?, notas=?, tipo_pago=? WHERE id=?',
    [paciente_id, doctor_id, fecha, hora, motivo, estado, notas, tipo_pago || 'pendiente_pago', id]
  );
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE citas SET estado=? WHERE id=?', [estado, id]);
};

const updateTipoPago = async (id, tipo_pago) => {
  await pool.query('UPDATE citas SET tipo_pago=? WHERE id=?', [tipo_pago, id]);
};

const remove = async (id) => {
  await pool.query('DELETE FROM citas WHERE id=?', [id]);
};

module.exports = { getByMonth, getByDate, getById, create, update, updateEstado, updateTipoPago, remove };
