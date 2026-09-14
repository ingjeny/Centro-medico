const pool = require('../../config/database');
const { getScope } = require('../../helpers/scope');

const getByPaciente = async (paciente_id, user) => {
  const cid = getScope(user);
  const vals = [paciente_id];
  const extra = cid !== null ? (vals.push(cid), ' AND h.consultorio_id = ?') : '';
  const [rows] = await pool.query(
    `SELECT h.*, u.nombre AS doctor_nombre, e.nombre AS especialidad_nombre, e.color AS especialidad_color
     FROM historias_clinicas h
     JOIN usuarios u ON h.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     WHERE h.paciente_id = ?${extra}
     ORDER BY h.fecha DESC`,
    vals
  );
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query(
    `SELECT h.*,
      CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
      p.cedula, p.fecha_nacimiento, p.sexo, p.tipo_sangre, p.alergias, p.telefono, p.direccion,
      u.nombre AS doctor_nombre, u.especialidad, u.especialidad_id,
      e.nombre AS especialidad_nombre, e.color AS especialidad_color
     FROM historias_clinicas h
     JOIN pacientes p ON h.paciente_id = p.id
     JOIN usuarios u ON h.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     WHERE h.id = ?`,
    [id]
  );
  const row = rows[0];
  if (row?.datos_extra && typeof row.datos_extra === 'string') {
    try { row.datos_extra = JSON.parse(row.datos_extra); } catch (_) { row.datos_extra = {}; }
  }
  return row;
};

const getMedicamentos = async (historia_id) => {
  const [rows] = await pool.query('SELECT * FROM medicamentos WHERE historia_id = ?', [historia_id]);
  return rows;
};

const getIncapacidades = async (historia_id) => {
  const [rows] = await pool.query('SELECT * FROM incapacidades WHERE historia_id = ?', [historia_id]);
  return rows;
};

const create = async (data, user) => {
  const {
    cita_id, paciente_id, doctor_id, fecha,
    motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
    tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
    temperatura, peso, talla, saturacion_o2, datos_extra,
  } = data;
  let cid = user?.consultorio_id || null;
  if (!cid && doctor_id) {
    const [doc] = await pool.query('SELECT consultorio_id FROM usuarios WHERE id = ?', [doctor_id]);
    cid = doc[0]?.consultorio_id || null;
  }
  if (!cid && paciente_id) {
    const [pac] = await pool.query('SELECT consultorio_id FROM pacientes WHERE id = ?', [paciente_id]);
    cid = pac[0]?.consultorio_id || null;
  }
  if (!cid) {
    const [first] = await pool.query('SELECT id FROM consultorios ORDER BY id ASC LIMIT 1');
    cid = first[0]?.id || 1;
  }
  const [result] = await pool.query(
    `INSERT INTO historias_clinicas
      (cita_id, paciente_id, doctor_id, fecha,
       motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
       tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
       temperatura, peso, talla, saturacion_o2, datos_extra, consultorio_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      cita_id || null, paciente_id, doctor_id || user.id, fecha,
      motivo_consulta || null, sintomas || null, examen_fisico || null,
      diagnostico || null, tratamiento || null, observaciones || null,
      tension_arterial || null, frecuencia_cardiaca || null, frecuencia_respiratoria || null,
      temperatura || null, peso || null, talla || null, saturacion_o2 || null,
      datos_extra ? JSON.stringify(datos_extra) : null,
      cid,
    ]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const {
    motivo_consulta, sintomas, examen_fisico, diagnostico, tratamiento, observaciones,
    tension_arterial, frecuencia_cardiaca, frecuencia_respiratoria,
    temperatura, peso, talla, saturacion_o2, datos_extra,
  } = data;
  await pool.query(
    `UPDATE historias_clinicas SET
       motivo_consulta=?, sintomas=?, examen_fisico=?, diagnostico=?, tratamiento=?, observaciones=?,
       tension_arterial=?, frecuencia_cardiaca=?, frecuencia_respiratoria=?,
       temperatura=?, peso=?, talla=?, saturacion_o2=?, datos_extra=?
     WHERE id=?`,
    [
      motivo_consulta || null, sintomas || null, examen_fisico || null,
      diagnostico || null, tratamiento || null, observaciones || null,
      tension_arterial || null, frecuencia_cardiaca || null, frecuencia_respiratoria || null,
      temperatura || null, peso || null, talla || null, saturacion_o2 || null,
      datos_extra ? JSON.stringify(datos_extra) : null, id,
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

// ── Adjuntos Clínicos (Exámenes, Laboratorios, Imágenes) ────────────────────
const getAdjuntos = async (historia_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM adjuntos_historia WHERE historia_id = ? ORDER BY created_at DESC',
    [historia_id]
  );
  return rows;
};

const getAdjuntoById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM adjuntos_historia WHERE id = ?', [id]);
  return rows[0];
};

const addAdjunto = async ({ historia_id, paciente_id, nombre_original, archivo_path, tipo_archivo, descripcion }) => {
  const [result] = await pool.query(
    `INSERT INTO adjuntos_historia 
      (historia_id, paciente_id, nombre_original, archivo_path, tipo_archivo, descripcion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [historia_id || null, paciente_id, nombre_original, archivo_path, tipo_archivo || 'documento', descripcion || null]
  );
  return result.insertId;
};

const deleteAdjunto = async (id) => {
  await pool.query('DELETE FROM adjuntos_historia WHERE id = ?', [id]);
};

module.exports = {
  getByPaciente, getById, getMedicamentos, getIncapacidades,
  create, update, addMedicamento, deleteMedicamentos,
  getAdjuntos, getAdjuntoById, addAdjunto, deleteAdjunto,
};
