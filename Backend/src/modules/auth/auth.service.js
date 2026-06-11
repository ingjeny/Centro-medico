const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findByEmail } = require('./auth.model');

const login = async (email, password) => {
  const user = await findByEmail(email);
  if (!user) throw new Error('Credenciales inválidas');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Credenciales inválidas');

  const payload = {
    id:              user.id,
    nombre:          user.nombre,
    email:           user.email,
    rol:             user.rol,
    consultorio_id:  user.consultorio_id  || null,
    especialidad_id: user.especialidad_id || null,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  return { token, user: payload };
};

module.exports = { login };
