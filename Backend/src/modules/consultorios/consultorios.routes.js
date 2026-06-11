const router = require('express').Router();
const ctrl = require('./consultorios.controller');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

router.use(verifyToken);
router.use(checkRole('admin'));   // solo admin gestiona consultorios

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getById);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
