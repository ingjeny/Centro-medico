const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
const { uploadLogo } = require('../../middlewares/upload');

router.use(verifyToken);

// Subir logo del consultorio
router.post('/logo', checkRole('admin'), uploadLogo.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se recibió imagen' });
  const logo_path = req.file.path.replace(/\\/g, '/');
  res.json({ logo_path, message: 'Logo actualizado' });
});

// Obtener ruta del logo actual
router.get('/logo', (req, res) => {
  const dir = path.join(__dirname, '../../../uploads/logo');
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  if (files.length === 0) return res.json({ logo_path: null });
  res.json({ logo_path: `uploads/logo/${files[0]}` });
});

module.exports = router;
