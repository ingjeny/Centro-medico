const model = require('./especialidades.model');

const getAll    = async (req, res) => { try { res.json(await model.getAll()); } catch (e) { res.status(500).json({ message: e.message }); } };
const getById   = async (req, res) => { try { const e = await model.getById(req.params.id); if (!e) return res.status(404).json({ message: 'No encontrada' }); res.json(e); } catch (e) { res.status(500).json({ message: e.message }); } };
const create    = async (req, res) => { try { const id = await model.create(req.body); res.status(201).json({ id, message: 'Especialidad creada' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const update    = async (req, res) => { try { await model.update(req.params.id, req.body); res.json({ message: 'Actualizada' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const remove    = async (req, res) => { try { await model.remove(req.params.id); res.json({ message: 'Eliminada' }); } catch (e) { res.status(500).json({ message: e.message }); } };

const getCampos      = async (req, res) => { try { res.json(await model.getCampos(req.params.id)); } catch (e) { res.status(500).json({ message: e.message }); } };
const createCampo    = async (req, res) => { try { const id = await model.createCampo({ ...req.body, especialidad_id: req.params.id }); res.status(201).json({ id, message: 'Campo creado' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const updateCampo    = async (req, res) => { try { await model.updateCampo(req.params.campoId, req.body); res.json({ message: 'Campo actualizado' }); } catch (e) { res.status(400).json({ message: e.message }); } };
const deleteCampo    = async (req, res) => { try { await model.deleteCampo(req.params.campoId); res.json({ message: 'Campo eliminado' }); } catch (e) { res.status(500).json({ message: e.message }); } };
const reorderCampos  = async (req, res) => { try { await model.reorderCampos(req.body.ids); res.json({ message: 'Orden actualizado' }); } catch (e) { res.status(400).json({ message: e.message }); } };

module.exports = { getAll, getById, create, update, remove, getCampos, createCampo, updateCampo, deleteCampo, reorderCampos };
