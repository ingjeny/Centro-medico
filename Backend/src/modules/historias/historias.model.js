const pool = require('../../config/database');

const getByPaciente = async (paciente_id) => {
  const [rows] = await pool.query(
    `SELECT h.*, u.nombre AS doctor_nombre
     FROM historias_clinicas h
     JOIN usuarios u ON h.doctor_id = u.id
     WHERE h.paciente_id = ?
     ORDER BY h.fecha DESC`,
    [paciente_id]
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT h.*,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      p.cedula, p.fecha_nacimiento, p.sexo, p.tipo_sangre, p.alergias, p.telefono, p.direccion,
      u.nombre AS doctor_nombre, u.especialidad
     FROM historias_clinicas h
     JOIN pacientes p ON h.paciente_id = p.id
     JOIN usuarios u ON h.doctor_id = u.id
     WHERE h.id = ?`,
    [id]
  );
  return rows[0];
};

const getMedicamentos = async (historia_id) => {
  const [rows] = await pool.query('SELECT * FROM medicamentos WHERE historia_id = ?', [historia_id]);
  return rows;
};

const getIncapacidades = async (historia_id) => {
  const [rows] = await pool.query('SELECT * FROM incapacidades WHERE historia_id = ?', [historia_id]);
  return rows;
};

const create = async (data) => {
  const {
    cita_id, paciente_id, doctor_id, fecha,
    motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
    tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
    temperatura, peso, talla, saturacion_o2,
  } = data;
  const [result] = await pool.query(
    `INSERT INTO historias_clinicas
      (cita_id, paciente_id, doctor_id, fecha,
       motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
       tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
       temperatura, peso, talla, saturacion_o2)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      cita_id || null, paciente_id, doctor_id, fecha,
      motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
      tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
      temperatura, peso, talla, saturacion_o2,
    ]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const {
    motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
    tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
    temperatura, peso, talla, saturacion_o2,
  } = data;
  await pool.query(
    `UPDATE historias_clinicas SET
       motivo_consulta=?, sintomas=?, examen_fisico=?, diagnostico=?, tratamiento=?, observaciones=?,
       tension_arterial=?, frecuencia_cardiaca=?, frecuencia_respiratoria=?,
       temperatura=?, peso=?, talla=?, saturacion_o2=?
     WHERE id=?`,
    [
      motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
      tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
      temperatura, peso, talla, saturacion_o2, id,
    ]
  );
};

const addMedicamento = async ({ historia_id, nombre, dosis, frecuencia, duracion, indicaciones }) => {
  const [result] = await pool.query(
    'INSERT INTO medicamentos (historia_id, nombre, dosis, frecuencia, duracion, indicaciones) VALUES (?,?,?,?,?,?)',
    [historia_id, nombre, dosis, frecuencia, duracion, indicaciones]
  );
  return result.insertId;
};

const deleteMedicamentos = async (historia_id) => {
  await pool.query('DELETE FROM medicamentos WHERE historia_id=?', [historia_id]);
};

module.exports = {
  getByPaciente, getById, getMedicamentos, getIncapacidades,
  create, update, addMedicamento, deleteMedicamentos,
};
