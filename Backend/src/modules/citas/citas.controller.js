const model = require('./citas.model');

const getByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    res.json(await model.getByMonth(year, month, req.user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getByDate = async (req, res) => {
  try {
    res.json(await model.getByDate(req.params.fecha, req.user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const cita = await model.getById(req.params.id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const id = await model.create(req.body, req.user);
    res.status(201).json({ id, message: 'Cita creada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    await model.update(req.params.id, req.body);
    res.json({ message: 'Cita actualizada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateEstado = async (req, res) => {
  try {
    await model.updateEstado(req.params.id, req.body.estado);
    res.json({ message: 'Estado actualizado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateTipoPago = async (req, res) => {
  try {
    await model.updateTipoPago(req.params.id, req.body.tipo_pago);
    res.json({ message: 'Tipo de pago actualizado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await model.remove(req.params.id);
    res.json({ message: 'Cita eliminada' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getByMonth, getByDate, getById, create, update, updateEstado, updateTipoPago, remove };
