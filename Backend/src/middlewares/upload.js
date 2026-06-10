const multer = require('multer');
const path = require('path');

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG o PNG'));
};

const firmaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/firmas/'),
  filename: (req, file, cb) => cb(null, `firma_${req.user.id}${path.extname(file.originalname).toLowerCase()}`),
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/logo/'),
  filename: (req, file, cb) => cb(null, `logo${path.extname(file.originalname).toLowerCase()}`),
});

exports.uploadFirma = multer({ storage: firmaStorage, fileFilter: imageFilter, limits: { fileSize: 2 * 1024 * 1024 } });
exports.uploadLogo  = multer({ storage: logoStorage,  fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });
