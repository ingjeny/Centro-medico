const model = require('./consultorios.model');

const getAll  = async (req, res) => { try { res.json(await model.getAll()); } catch (e) { res.status(500).json({ message: e.message }); } };
const getById = async (req, res) => { try { const c = await model.getById(req.params.id); if (!c) return res.status(404).json({ message: 'No encontrado' }); res.json(c); } catch (e) { res.status(500).json({ message: e.message }); } };
const create  = async (req, res) => { try { const id = await model.create(req.body); res.status(201).json({ id, message: 'Consultorio creado' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const update  = async (req, res) => { try { await model.update(req.params.id, req.body); res.json({ message: 'Actualizado' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const remove  = async (req, res) => { try { await model.remove(req.params.id); res.json({ message: 'Desactivado' }); } catch (e) { res.status(500).json({ message: e.message }); } };

module.exports = { getAll, getById, create, update, remove };
