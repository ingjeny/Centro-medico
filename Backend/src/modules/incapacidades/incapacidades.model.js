const pool = require('../../config/database');

const getByPaciente = async (paciente_id) => {
  const [rows] = await pool.query(
    `SELECT i.*, u.nombre AS doctor_nombre, u.especialidad_id,
      e.nombre AS especialidad, CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre, p.cedula
     FROM incapacidades i
     JOIN usuarios u ON i.doctor_id = u.id
     JOIN pacientes p ON i.paciente_id = p.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     WHERE i.paciente_id = ?
     ORDER BY i.fecha_emision DESC`,
    [paciente_id]
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT i.*, u.nombre AS doctor_nombre, u.especialidad_id,
      e.nombre AS especialidad,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      p.cedula, p.fecha_nacimiento, p.sexo, p.telefono, p.direccion
     FROM incapacidades i
     JOIN usuarios u ON i.doctor_id = u.id
     JOIN pacientes p ON i.paciente_id = p.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     WHERE i.id = ?`,
    [id]
  );
  return rows[0];
};

const create = async ({ historia_id, paciente_id, doctor_id, fecha_emision, fecha_inicio, fecha_fin, dias, diagnostico, tipo, observaciones }, user) => {
  const cid = user?.consultorio_id || null;
  const [result] = await pool.query(
    `INSERT INTO incapacidades
      (historia_id, paciente_id, doctor_id, fecha_emision, fecha_inicio, fecha_fin, dias, diagnostico, tipo, observaciones, consultorio_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [historia_id||null, paciente_id, doctor_id, fecha_emision, fecha_inicio, fecha_fin, dias, diagnostico, tipo, observaciones, cid]
  );
  return result.insertId;
};

const remove = async (id) => {
  await pool.query('DELETE FROM incapacidades WHERE id=?', [id]);
};

module.exports = { getByPaciente, getById, create, remove };
