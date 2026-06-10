const router = require('express').Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/usuarios', require('../modules/usuarios/usuarios.routes'));
router.use('/pacientes', require('../modules/pacientes/pacientes.routes'));
router.use('/citas', require('../modules/citas/citas.routes'));
router.use('/historias', require('../modules/historias/historias.routes'));
router.use('/incapacidades', require('../modules/incapacidades/incapacidades.routes'));
router.use('/config', require('../modules/config/config.routes'));

module.exports = router;
