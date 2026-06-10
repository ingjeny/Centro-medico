const model = require('./pacientes.model');

const getAll = async (req, res) => {
  try {
    const { q } = req.query;
    const data = q ? await model.search(q) : await model.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const paciente = await model.getById(req.params.id);
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    res.json(paciente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await model.create(req.body);
    res.status(201).json({ id, message: 'Paciente registrado' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    await model.update(req.params.id, req.body);
    res.json({ message: 'Paciente actualizado' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await model.remove(req.params.id);
    res.json({ message: 'Paciente eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
