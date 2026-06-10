const router = require('express').Router();
const ctrl = require('./citas.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);

router.get('/', ctrl.getByMonth);
router.get('/fecha/:fecha', ctrl.getByDate);
router.get('/:id', ctrl.getById);
router.post('/', checkRole('admin', 'secretaria'), ctrl.create);
router.put('/:id', checkRole('admin', 'secretaria'), ctrl.update);
router.patch('/:id/estado', ctrl.updateEstado);
router.patch('/:id/pago', checkRole('admin', 'secretaria'), ctrl.updateTipoPago);
router.delete('/:id', checkRole('admin', 'secretaria'), ctrl.remove);

module.exports = router;
