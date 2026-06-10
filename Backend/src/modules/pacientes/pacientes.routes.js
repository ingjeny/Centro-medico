const router = require('express').Router();
const ctrl = require('./pacientes.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', checkRole('admin', 'secretaria'), ctrl.create);
router.put('/:id', checkRole('admin', 'secretaria'), ctrl.update);
router.delete('/:id', checkRole('admin'), ctrl.remove);

module.exports = router;
