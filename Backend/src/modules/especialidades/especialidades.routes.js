const router = require('express').Router();
const ctrl = require('./especialidades.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);

// Especialidades — todos pueden listarlas; solo admin crea/edita/elimina
router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/',              checkRole('admin'), ctrl.create);
router.put('/:id',            checkRole('admin'), ctrl.update);
router.delete('/:id',         checkRole('admin'), ctrl.remove);

// Campos de una especialidad
router.get('/:id/campos',                    ctrl.getCampos);
router.post('/:id/campos',  checkRole('admin'), ctrl.createCampo);
router.post('/:id/campos/reorder', checkRole('admin'), ctrl.reorderCampos);
router.put('/:id/campos/:campoId',  checkRole('admin'), ctrl.updateCampo);
router.delete('/:id/campos/:campoId', checkRole('admin'), ctrl.deleteCampo);

module.exports = router;
