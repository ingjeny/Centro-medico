const path = require('path');
const fs = require('fs');

const UPLOADS = path.join(__dirname, '../../../uploads');

/**
 * Retorna la ruta absoluta del logo si existe, o null.
 */
function getLogoPath() {
  const dir = path.join(UPLOADS, 'logo');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  return files.length ? path.join(dir, files[0]) : null;
}

/**
 * Retorna la ruta absoluta de la firma de un doctor, o null.
 */
function getFirmaPath(doctorId) {
  const dir = path.join(UPLOADS, 'firmas');
  if (!fs.existsSync(dir)) return null;
  const extensions = ['.png', '.jpg', '.jpeg'];
  for (const ext of extensions) {
    const p = path.join(dir, `firma_${doctorId}${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Dibuja el header del documento: logo izquierda + info clínica derecha.
 * Retorna el nuevo Y tras el header.
 */
function drawHeader(doc, logoPath, clinicInfo = {}) {
  const W = 505;
  const blue = '#1a3e72';
  const gray = '#64748b';
  let y = 40;

  // Línea azul superior
  doc.rect(55, y, W, 3).fill(blue);
  y += 10;

  // Logo
  if (logoPath) {
    try {
      doc.image(logoPath, 55, y, { height: 48, fit: [140, 48] });
    } catch (_) { /* logo corrupto, ignorar */ }
  } else {
    doc.rect(55, y, 130, 48).fill('#f1f5f9');
    doc.fill(gray).font('Helvetica').fontSize(9)
      .text('CONSULTORIO', 55, y + 20, { width: 130, align: 'center' });
  }

  // Información del consultorio (derecha)
  const infoX = 300;
  doc.fill(blue).font('Helvetica-Bold').fontSize(10)
    .text(clinicInfo.nombre || 'Consultorio Médico', infoX, y, { width: W - 245, align: 'right' });
  doc.fill(gray).font('Helvetica').fontSize(8);
  let infoY = y + 14;
  if (clinicInfo.nit)      { doc.text(`NIT: ${clinicInfo.nit}`,    infoX, infoY, { width: W - 245, align: 'right' }); infoY += 11; }
  if (clinicInfo.direccion) { doc.text(clinicInfo.direccion,        infoX, infoY, { width: W - 245, align: 'right' }); infoY += 11; }
  if (clinicInfo.telefono)  { doc.text(`Tel: ${clinicInfo.telefono}`, infoX, infoY, { width: W - 245, align: 'right' }); infoY += 11; }
  if (clinicInfo.ciudad)    { doc.text(clinicInfo.ciudad,           infoX, infoY, { width: W - 245, align: 'right' }); }

  y += 58;
  // Línea separadora
  doc.moveTo(55, y).lineTo(560, y).lineWidth(0.5).stroke('#e2e8f0');
  y += 10;

  return y;
}

/**
 * Dibuja la firma del doctor al final del documento.
 */
function drawFirma(doc, firmaPath, doctorNombre, especialidad) {
  const gray = '#64748b';
  const blue = '#1a3e72';
  let y = doc.page.height - 110;

  doc.moveTo(55, y).lineTo(560, y).lineWidth(0.5).stroke('#e2e8f0');
  y += 10;

  if (firmaPath) {
    try {
      doc.image(firmaPath, 55, y, { height: 45, fit: [160, 45] });
    } catch (_) { /* firma corrupta */ }
  }

  // Línea de firma + nombre
  doc.moveTo(280, y + 42).lineTo(550, y + 42).lineWidth(0.5).stroke(gray);
  doc.fill(blue).font('Helvetica-Bold').fontSize(9)
    .text(`Dr./Dra. ${doctorNombre}`, 280, y + 44, { width: 270, align: 'center' });
  if (especialidad) {
    doc.fill(gray).font('Helvetica').fontSize(8)
      .text(especialidad, 280, y + 56, { width: 270, align: 'center' });
  }
  doc.fill(gray).font('Helvetica').fontSize(7.5)
    .text('Firma y Sello Médico', 280, y + 68, { width: 270, align: 'center' });

  // Fecha de impresión
  doc.fill(gray).font('Helvetica').fontSize(7)
    .text(`Impreso: ${new Date().toLocaleString('es-ES')}`, 55, doc.page.height - 28, { width: W });
}

module.exports = { getLogoPath, getFirmaPath, drawHeader, drawFirma };
