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
      p.telefono AS paciente_telefono,
      u.nombre AS doctor_nombre,
      e.nombre AS especialidad_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
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
      p.telefono AS paciente_telefono,
      u.nombre AS doctor_nombre,
      e.nombre AS especialidad_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
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
      p.cedula AS paciente_cedula,
      p.telefono AS paciente_telefono,
      p.email AS paciente_email,
      p.direccion AS paciente_direccion,
      u.nombre AS doctor_nombre,
      u.especialidad AS doctor_especialidad,
      e.nombre AS especialidad_nombre,
      cs.nombre AS consultorio_nombre,
      cs.nit AS consultorio_nit,
      cs.direccion AS consultorio_direccion,
      cs.telefono AS consultorio_telefono,
      cs.ciudad AS consultorio_ciudad
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     LEFT JOIN consultorios cs ON c.consultorio_id = cs.id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0];
};

const create = async ({ paciente_id, doctor_id, fecha, hora, motivo, notas, tipo_pago, costo, metodo_pago, notas_pago }, user) => {
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
  const pagado_at = tipo_pago === 'pagada' ? new Date() : null;
  const [result] = await pool.query(
    `INSERT INTO citas 
      (paciente_id, doctor_id, fecha, hora, motivo, notas, tipo_pago, costo, metodo_pago, notas_pago, pagado_at, consultorio_id) 
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      paciente_id, doctor_id, fecha, hora, motivo || null, notas || null,
      tipo_pago || 'pendiente_pago', costo || 0, metodo_pago || 'efectivo',
      notas_pago || null, pagado_at, cid
    ]
  );
  return result.insertId;
};

const update = async (id, { paciente_id, doctor_id, fecha, hora, motivo, estado, notas, tipo_pago, costo, metodo_pago, notas_pago }) => {
  await pool.query(
    `UPDATE citas SET 
       paciente_id=?, doctor_id=?, fecha=?, hora=?, motivo=?, estado=?, notas=?, 
       tipo_pago=?, costo=?, metodo_pago=?, notas_pago=? 
     WHERE id=?`,
    [
      paciente_id, doctor_id, fecha, hora, motivo, estado, notas,
      tipo_pago || 'pendiente_pago', costo || 0, metodo_pago || 'efectivo',
      notas_pago || null, id
    ]
  );
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE citas SET estado=? WHERE id=?', [estado, id]);
};

const updateTipoPago = async (id, tipo_pago) => {
  const pagado_at = tipo_pago === 'pagada' ? new Date() : null;
  await pool.query('UPDATE citas SET tipo_pago=?, pagado_at=? WHERE id=?', [tipo_pago, pagado_at, id]);
};

const registrarCobro = async (id, { tipo_pago, costo, metodo_pago, notas_pago }) => {
  const pagado_at = tipo_pago === 'pagada' ? new Date() : null;
  await pool.query(
    `UPDATE citas SET 
       tipo_pago=?, costo=?, metodo_pago=?, notas_pago=?, pagado_at=? 
     WHERE id=?`,
    [tipo_pago || 'pagada', costo || 0, metodo_pago || 'efectivo', notas_pago || null, pagado_at, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM citas WHERE id=?', [id]);
};

// ── Módulo de Caja: Resumen y Movimientos ────────────────────────────────────
const getResumenCaja = async ({ fecha, doctor_id }, user) => {
  const vals = [fecha];
  let queryWhere = 'c.fecha = ?';

  const cid = getScope(user);
  if (cid !== null) {
    queryWhere += ' AND c.consultorio_id = ?';
    vals.push(cid);
  }

  if (doctor_id) {
    queryWhere += ' AND c.doctor_id = ?';
    vals.push(doctor_id);
  }

  const [movimientos] = await pool.query(
    `SELECT c.id, c.fecha, c.hora, c.motivo, c.estado, c.tipo_pago, c.costo, c.metodo_pago, c.notas_pago, c.pagado_at,
       CONCAT(p.nombre, ' ', p.apellido) AS paciente_nombre,
       p.cedula AS paciente_cedula,
       u.nombre AS doctor_nombre,
       e.nombre AS especialidad_nombre
     FROM citas c
     JOIN pacientes p ON c.paciente_id = p.id
     JOIN usuarios u ON c.doctor_id = u.id
     LEFT JOIN especialidades e ON u.especialidad_id = e.id
     WHERE ${queryWhere}
     ORDER BY c.hora ASC`,
    vals
  );

  // Totales
  let totalRecaudado = 0;
  let totalEfectivo = 0;
  let totalTransferencia = 0;
  let totalTarjeta = 0;
  let totalOtro = 0;
  let pagadasCount = 0;
  let pendientesCount = 0;

  movimientos.forEach(m => {
    const val = parseFloat(m.costo) || 0;
    if (m.tipo_pago === 'pagada') {
      totalRecaudado += val;
      pagadasCount++;
      if (m.metodo_pago === 'efectivo') totalEfectivo += val;
      else if (m.metodo_pago === 'transferencia') totalTransferencia += val;
      else if (m.metodo_pago === 'tarjeta') totalTarjeta += val;
      else totalOtro += val;
    } else {
      pendientesCount++;
    }
  });

  return {
    fecha,
    totalRecaudado,
    desgloseMetodos: {
      efectivo: totalEfectivo,
      transferencia: totalTransferencia,
      tarjeta: totalTarjeta,
      otro: totalOtro,
    },
    citasCount: {
      total: movimientos.length,
      pagadas: pagadasCount,
      pendientes: pendientesCount,
    },
    movimientos,
  };
};

module.exports = {
  getByMonth, getByDate, getById, create, update,
  updateEstado, updateTipoPago, registrarCobro, remove,
  getResumenCaja,
};
