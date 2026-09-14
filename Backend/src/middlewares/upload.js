const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar directorios de carga
['uploads/firmas', 'uploads/logo', 'uploads/adjuntos'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const imageFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
};

const adjuntoFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Formato de archivo no admitido. Se admiten PDF, imágenes o documentos.'));
};

const firmaStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/firmas/'),
  filename: (req, file, cb) => cb(null, `firma_${req.user.id}${path.extname(file.originalname).toLowerCase()}`),
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/logo/'),
  filename: (req, file, cb) => cb(null, `logo${path.extname(file.originalname).toLowerCase()}`),
});

const adjuntoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/adjuntos/'),
  filename: (req, file, cb) => {
    const cleanName = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${cleanName}${ext}`);
  },
});

exports.uploadFirma   = multer({ storage: firmaStorage,   fileFilter: imageFilter,   limits: { fileSize: 2 * 1024 * 1024 } });
exports.uploadLogo    = multer({ storage: logoStorage,    fileFilter: imageFilter,   limits: { fileSize: 3 * 1024 * 1024 } });
exports.uploadAdjunto = multer({ storage: adjuntoStorage, fileFilter: adjuntoFilter, limits: { fileSize: 25 * 1024 * 1024 } });
