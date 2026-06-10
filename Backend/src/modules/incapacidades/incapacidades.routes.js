const router = require('express').Router();
const ctrl = require('./incapacidades.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);

router.get('/paciente/:paciente_id', ctrl.getByPaciente);
router.get('/:id/pdf', ctrl.generatePDF);
router.post('/', checkRole('admin', 'doctor'), ctrl.create);
router.delete('/:id', checkRole('admin', 'doctor'), ctrl.remove);

module.exports = router;
