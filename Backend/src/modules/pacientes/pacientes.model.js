const pool = require('../../config/database');
const { getScope } = require('../../helpers/scope');

const getAll = async (user) => {
  const cid = getScope(user);
  const [rows] = cid !== null
    ? await pool.query('SELECT * FROM pacientes WHERE consultorio_id=? ORDER BY apellido, nombre', [cid])
    : await pool.query('SELECT * FROM pacientes ORDER BY apellido, nombre');
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [id]);
  return rows[0];
};

const search = async (q, user) => {
  const like = `%${q}%`;
  const cid = getScope(user);
  const [rows] = cid !== null
    ? await pool.query(
        'SELECT * FROM pacientes WHERE consultorio_id=? AND (nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?) ORDER BY apellido',
        [cid, like, like, like]
      )
    : await pool.query(
        'SELECT * FROM pacientes WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? ORDER BY apellido',
        [like, like, like]
      );
  return rows;
};

const create = async (data, user) => {
  const {
    cedula, nombre, apellido, fecha_nacimiento, sexo,
    telefono, email, direccion, tipo_sangre, alergias, antecedentes,
  } = data;
  const cid = user.consultorio_id || null;
  const [result] = await pool.query(
    `INSERT INTO pacientes
      (cedula, nombre, apellido, fecha_nacimiento, sexo,
       telefono, email, direccion, tipo_sangre, alergias, antecedentes, consultorio_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [cedula, nombre, apellido, fecha_nacimiento || null, sexo || null,
     telefono || null, email || null, direccion || null,
     tipo_sangre || null, alergias || null, antecedentes || null, cid]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const {
    cedula, nombre, apellido, fecha_nacimiento, sexo,
    telefono, email, direccion, tipo_sangre, alergias, antecedentes,
  } = data;
  await pool.query(
    `UPDATE pacientes SET cedula=?, nombre=?, apellido=?, fecha_nacimiento=?, sexo=?,
     telefono=?, email=?, direccion=?, tipo_sangre=?, alergias=?, antecedentes=? WHERE id=?`,
    [cedula, nombre, apellido, fecha_nacimiento || null, sexo || null,
     telefono || null, email || null, direccion || null,
     tipo_sangre || null, alergias || null, antecedentes || null, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM pacientes WHERE id=?', [id]);
};

module.exports = { getAll, getById, search, create, update, remove };
