const router = require('express').Router();
const ctrl = require('./usuarios.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
const { uploadFirma } = require('../../middlewares/upload');

router.use(verifyToken);

router.get('/', checkRole('admin'), ctrl.getAll);
router.get('/me', ctrl.getMe);
router.get('/doctores', ctrl.getDoctores);
router.post('/', checkRole('admin'), ctrl.create);
router.put('/:id', checkRole('admin'), ctrl.update);
router.put('/:id/password', checkRole('admin'), ctrl.updatePassword);
router.post('/:id/firma', uploadFirma.single('firma'), ctrl.uploadFirma);
router.post('/me/firma', uploadFirma.single('firma'), ctrl.uploadFirma);
router.delete('/:id', checkRole('admin'), ctrl.remove);

module.exports = router;
