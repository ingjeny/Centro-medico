const pool = require('../../config/database');

const getAll = async () => {
  const [rows] = await pool.query('SELECT * FROM pacientes ORDER BY apellido, nombre');
  return rows;
};

const getById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [id]);
  return rows[0];
};

const search = async (q) => {
  const like = `%${q}%`;
  const [rows] = await pool.query(
    'SELECT * FROM pacientes WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ? ORDER BY apellido',
    [like, like, like]
  );
  return rows;
};

const create = async (data) => {
  const { cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias, antecedentes } = data;
  const [result] = await pool.query(
    'INSERT INTO pacientes (cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias, antecedentes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias, antecedentes]
  );
  return result.insertId;
};

const update = async (id, data) => {
  const { cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias, antecedentes } = data;
  await pool.query(
    'UPDATE pacientes SET cedula=?, nombre=?, apellido=?, fecha_nacimiento=?, sexo=?, telefono=?, email=?, direccion=?, tipo_sangre=?, alergias=?, antecedentes=? WHERE id=?',
    [cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias, antecedentes, id]
  );
};

const remove = async (id) => {
  await pool.query('DELETE FROM pacientes WHERE id=?', [id]);
};

module.exports = { getAll, getById, search, create, update, remove };
