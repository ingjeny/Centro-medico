const router = require('express').Router();
const { loginController } = require('./auth.controller');

router.post('/login', loginController);

module.exports = router;
