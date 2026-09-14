const router = require('express').Router();
const ctrl = require('./historias.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
const { uploadAdjunto } = require('../../middlewares/upload');

router.use(verifyToken);

router.get('/paciente/:paciente_id', ctrl.getByPaciente);
router.get('/:id', ctrl.getById);
router.get('/:id/pdf', ctrl.generatePDF);
router.get('/:id/receta-pdf', ctrl.generateRecetaPDF);

// Adjuntos clínicos
router.get('/:id/adjuntos', ctrl.getAdjuntos);
router.post('/:id/adjuntos', checkRole('admin', 'doctor', 'secretaria'), uploadAdjunto.single('archivo'), ctrl.subirAdjunto);
router.delete('/adjuntos/:adjuntoId', checkRole('admin', 'doctor'), ctrl.eliminarAdjunto);

router.post('/', checkRole('admin', 'doctor'), ctrl.create);
router.put('/:id', checkRole('admin', 'doctor'), ctrl.update);

module.exports = router;
