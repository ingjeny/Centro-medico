const bcrypt = require('bcryptjs');
const model = require('./usuarios.model');

const getAll = async (req, res) => {
  try { res.json(await model.getAll(req.user)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const getDoctores = async (req, res) => {
  try { res.json(await model.getDoctores(req.user)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const getMe = async (req, res) => {
  try { res.json(await model.getById(req.user.id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const { nombre, email, password, rol, especialidad, especialidad_id, consultorio_id } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const id = await model.create({ nombre, email, password: hashed, rol, especialidad, especialidad_id, consultorio_id });
    res.status(201).json({ id, message: 'Usuario creado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    const { nombre, email, rol, especialidad, especialidad_id, consultorio_id, activo } = req.body;
    await model.update(req.params.id, { nombre, email, rol, especialidad, especialidad_id, consultorio_id, activo });
    res.json({ message: 'Usuario actualizado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updatePassword = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await model.updatePassword(req.params.id, hashed);
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const uploadFirma = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se recibió imagen' });
    const firma_path = req.file.path.replace(/\\/g, '/');
    const targetId = req.params.id || req.user.id;
    if (req.user.rol !== 'admin' && String(req.user.id) !== String(targetId)) {
      return res.status(403).json({ message: 'Sin permisos' });
    }
    await model.updateFirma(targetId, firma_path);
    res.json({ firma_path, message: 'Firma actualizada' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try { await model.remove(req.params.id); res.json({ message: 'Usuario desactivado' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, getDoctores, getMe, create, update, updatePassword, uploadFirma, remove };
