const model = require('./incapacidades.model');
const PDFDocument = require('pdfkit');
const { getLogoPath, getFirmaPath } = require('../historias/pdf.helper');

const getByPaciente = async (req, res) => {
  try { res.json(await model.getByPaciente(req.params.paciente_id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const data = { ...req.body, doctor_id: req.user.id };
    if (!data.dias && data.fecha_inicio && data.fecha_fin) {
      const d1 = new Date(data.fecha_inicio);
      const d2 = new Date(data.fecha_fin);
      data.dias = Math.round((d2 - d1) / 86400000) + 1;
    }
    const id = await model.create(data);
    res.status(201).json({ id, message: 'Incapacidad creada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try { await model.remove(req.params.id); res.json({ message: 'Incapacidad eliminada' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

// ── PDF Certificado ─────────────────────────────────────────────────────────

const generatePDF = async (req, res) => {
  try {
    const inc = await model.getById(req.params.id);
    if (!inc) return res.status(404).json({ message: 'Incapacidad no encontrada' });

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=incapacidad_${req.params.id}.pdf`);
    doc.pipe(res);

    const BLUE    = '#1B3A6B';
    const BLUE_LT = '#E8EDF5';
    const ACCENT  = '#2563EB';
    const GRAY    = '#64748B';
    const GRAY_LT = '#F8FAFC';
    const TEXT    = '#1E293B';
    const L = 45;
    const R = 550;
    const W = R - L;
    const PW = 595;

    const logoPath = getLogoPath();
    const firmaPath = getFirmaPath(inc.doctor_id);

    const TIPO_LABEL = {
      reposo:              'REPOSO MÉDICO',
      incapacidad_laboral: 'INCAPACIDAD LABORAL',
      reposo_relativo:     'REPOSO RELATIVO',
    };
    const tipoLabel = TIPO_LABEL[inc.tipo] || 'CERTIFICADO MÉDICO';

    // ── BANDA SUPERIOR ───────────────────────────────────────────────────────
    doc.rect(0, 0, PW, 72).fill(BLUE);

    if (logoPath) {
      try { doc.image(logoPath, L, 10, { height: 52, fit: [130, 52] }); }
      catch (_) {}
    }

    const titleX = logoPath ? 190 : L;
    const titleW = logoPath ? R - 190 : W;
    doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(16)
      .text('CERTIFICADO MÉDICO', titleX, 14, { width: titleW, align: logoPath ? 'right' : 'center' });
    doc.fill('#93C5FD').font('Helvetica-Bold').fontSize(10)
      .text(tipoLabel, titleX, 34, { width: titleW, align: logoPath ? 'right' : 'center' });
    doc.fill('rgba(255,255,255,0.6)').font('Helvetica').fontSize(7.5)
      .text(
        `N° ${String(inc.id).padStart(5, '0')}   ·   Emitido: ${new Date(inc.fecha_emision).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        titleX, 50, { width: titleW, align: logoPath ? 'right' : 'center' }
      );

    // ── FICHA PACIENTE ───────────────────────────────────────────────────────
    let y = 84;
    doc.rect(L, y, W, 52).fill(GRAY_LT).stroke('#E2E8F0').lineWidth(0.5);

    doc.fill(BLUE).font('Helvetica-Bold').fontSize(12)
      .text(inc.paciente_nombre || '—', L + 10, y + 8, { width: W * 0.55 });

    const demo = [
      inc.cedula           && `CC: ${inc.cedula}`,
      inc.fecha_nacimiento && `Nac: ${new Date(inc.fecha_nacimiento).toLocaleDateString('es-ES')}`,
      inc.telefono         && `Tel: ${inc.telefono}`,
      inc.direccion        && inc.direccion,
    ].filter(Boolean).join('   ');
    doc.fill(GRAY).font('Helvetica').fontSize(8).text(demo, L + 10, y + 24, { width: W * 0.55 });

    const mxL = L + W * 0.6;
    const mxW = W * 0.38;
    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text('MÉDICO CERTIFICANTE', mxL, y + 8, { width: mxW });
    doc.fill(TEXT).font('Helvetica').fontSize(9).text(inc.doctor_nombre || '—', mxL, y + 19, { width: mxW });
    if (inc.especialidad) {
      doc.fill(GRAY).font('Helvetica').fontSize(8).text(inc.especialidad, mxL, y + 31, { width: mxW });
    }
    y += 64;

    // ── BLOQUE PRINCIPAL: DÍAS ───────────────────────────────────────────────
    // Caja azul grande centrada
    const boxH = 100;
    doc.rect(L, y, W, boxH).fill(ACCENT);

    doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(52)
      .text(String(inc.dias), L, y + 8, { width: W, align: 'center' });
    doc.fill('#BFDBFE').font('Helvetica').fontSize(13)
      .text(inc.dias === 1 ? 'DÍA DE INCAPACIDAD' : 'DÍAS DE INCAPACIDAD', L, y + 66, { width: W, align: 'center' });

    y += boxH + 2;

    // Fila desde / hasta
    const halfW = W / 2 - 2;
    doc.rect(L,            y, halfW, 34).fill(BLUE_LT).stroke('#C7D2FE').lineWidth(0.5);
    doc.rect(L + halfW + 4, y, halfW, 34).fill(BLUE_LT).stroke('#C7D2FE').lineWidth(0.5);

    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7)
      .text('DESDE', L, y + 5, { width: halfW, align: 'center' });
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(8.5)
      .text(new Date(inc.fecha_inicio).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), L, y + 16, { width: halfW, align: 'center' });

    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7)
      .text('HASTA', L + halfW + 4, y + 5, { width: halfW, align: 'center' });
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(8.5)
      .text(new Date(inc.fecha_fin).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), L + halfW + 4, y + 16, { width: halfW, align: 'center' });

    y += 44;

    // ── SECCIÓN DETALLES ─────────────────────────────────────────────────────

    const section = (title) => {
      y += 10;
      doc.rect(L, y, 3, 16).fill(ACCENT);
      doc.rect(L + 3, y, W - 3, 16).fill(BLUE_LT);
      doc.fill(BLUE).font('Helvetica-Bold').fontSize(8)
        .text(title.toUpperCase(), L + 12, y + 4, { width: W - 20 });
      y += 22;
    };

    const field = (label, value) => {
      if (!value) return;
      doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text(label.toUpperCase(), L, y, { width: W });
      y += 11;
      doc.fill(TEXT).font('Helvetica').fontSize(9).text(String(value), L, y, { width: W, lineGap: 1.5 });
      y += doc.heightOfString(String(value), { width: W, lineGap: 1.5 }) + 8;
    };

    section('Tipo de certificado');
    field('Tipo', tipoLabel);

    if (inc.diagnostico) {
      section('Diagnóstico');
      field('', inc.diagnostico);
    }

    if (inc.observaciones) {
      section('Observaciones');
      field('', inc.observaciones);
    }

    // ── NOTA LEGAL ───────────────────────────────────────────────────────────
    y += 8;
    doc.rect(L, y, W, 30).fill(GRAY_LT).stroke('#E2E8F0').lineWidth(0.5);
    doc.fill(GRAY).font('Helvetica').fontSize(7.5)
      .text(
        'El presente certificado es emitido a solicitud del interesado para los fines que estime conveniente. ' +
        'El médico certifica la veracidad de los datos consignados basándose en la evaluación clínica realizada.',
        L + 8, y + 7, { width: W - 16, lineGap: 1.5 }
      );
    y += 38;

    // ── FIRMA ────────────────────────────────────────────────────────────────
    const sigY = 755;
    doc.moveTo(L, sigY).lineTo(R, sigY).lineWidth(0.5).stroke('#E2E8F0');

    if (firmaPath) {
      try { doc.image(firmaPath, L, sigY + 4, { height: 44, fit: [150, 44] }); }
      catch (_) {}
    }

    doc.moveTo(330, sigY + 48).lineTo(R, sigY + 48).lineWidth(0.5).stroke(GRAY);
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(9)
      .text(inc.doctor_nombre || '—', 330, sigY + 51, { width: R - 330, align: 'center' });
    if (inc.especialidad) {
      doc.fill(GRAY).font('Helvetica').fontSize(8)
        .text(inc.especialidad, 330, sigY + 63, { width: R - 330, align: 'center' });
    }
    doc.fill(GRAY).font('Helvetica').fontSize(7.5)
      .text('Firma y Sello Médico', 330, inc.especialidad ? sigY + 74 : sigY + 63, { width: R - 330, align: 'center' });

    doc.fill('#94A3B8').font('Helvetica').fontSize(7)
      .text(`Impreso: ${new Date().toLocaleString('es-ES')}`, L, 825, { width: W });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getByPaciente, create, remove, generatePDF };
