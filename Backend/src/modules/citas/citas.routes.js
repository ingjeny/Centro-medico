const router = require('express').Router();
const ctrl = require('./citas.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);

router.get('/', ctrl.getByMonth);
router.get('/fecha/:fecha', ctrl.getByDate);
router.get('/caja/resumen', ctrl.getResumenCaja);
router.get('/:id', ctrl.getById);
router.get('/:id/recibo-pdf', ctrl.generateReciboPDF);

router.post('/', checkRole('admin', 'secretaria', 'doctor'), ctrl.create);
router.put('/:id', checkRole('admin', 'secretaria', 'doctor'), ctrl.update);
router.patch('/:id/estado', ctrl.updateEstado);
router.patch('/:id/pago', checkRole('admin', 'secretaria'), ctrl.updateTipoPago);
router.patch('/:id/cobro', checkRole('admin', 'secretaria'), ctrl.registrarCobro);
router.delete('/:id', checkRole('admin', 'secretaria'), ctrl.remove);

module.exports = router;
