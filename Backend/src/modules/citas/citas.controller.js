const model = require('./citas.model');
const PDFDocument = require('pdfkit');
const { getLogoPath } = require('../historias/pdf.helper');

const getByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    res.json(await model.getByMonth(year, month, req.user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getByDate = async (req, res) => {
  try {
    res.json(await model.getByDate(req.params.fecha, req.user));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const cita = await model.getById(req.params.id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(cita);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const id = await model.create(req.body, req.user);
    res.status(201).json({ id, message: 'Cita creada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    await model.update(req.params.id, req.body);
    res.json({ message: 'Cita actualizada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateEstado = async (req, res) => {
  try {
    await model.updateEstado(req.params.id, req.body.estado);
    res.json({ message: 'Estado actualizado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateTipoPago = async (req, res) => {
  try {
    await model.updateTipoPago(req.params.id, req.body.tipo_pago);
    res.json({ message: 'Tipo de pago actualizado' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const registrarCobro = async (req, res) => {
  try {
    const { tipo_pago, costo, metodo_pago, notas_pago } = req.body;
    await model.registrarCobro(req.params.id, { tipo_pago, costo, metodo_pago, notas_pago });
    res.json({ message: 'Cobro registrado correctamente' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await model.remove(req.params.id);
    res.json({ message: 'Cita eliminada' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getResumenCaja = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
    const doctor_id = req.query.doctor_id || null;
    const resumen = await model.getResumenCaja({ fecha, doctor_id }, req.user);
    res.json(resumen);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Generador de Recibo de Pago en PDF ───────────────────────────────────────
const generateReciboPDF = async (req, res) => {
  try {
    const cita = await model.getById(req.params.id);
    if (!cita) return res.status(404).json({ message: 'Cita no encontrada' });

    const doc = new PDFDocument({ margin: 0, size: 'A5', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=recibo_cita_${cita.id}.pdf`);
    doc.pipe(res);

    const PW = 595, PH = 420; // A5 Horizontal
    const L = 35, R = PW - 35, W = R - L;
    const BLUE = '#1B3A6B', ACCENT = '#2563EB', GRAY = '#64748B', TEXT = '#0F172A', BG_LT = '#F8FAFC';

    // Barra superior
    doc.rect(0, 0, PW, 54).fill(BLUE);

    const logoPath = getLogoPath();
    if (logoPath) {
      try { doc.image(logoPath, L, 8, { height: 38, fit: [110, 38] }); } catch (_) {}
    }

    doc.fill('#FFF').font('Helvetica-Bold').fontSize(14)
      .text(cita.consultorio_nombre || 'CONSULTORIO MÉDICO', L + (logoPath ? 120 : 0), 12, { width: 280 });
    doc.fill('rgba(255,255,255,0.8)').font('Helvetica').fontSize(8)
      .text(`${cita.consultorio_nit ? 'NIT: ' + cita.consultorio_nit + ' · ' : ''}${cita.consultorio_direccion || ''}`, L + (logoPath ? 120 : 0), 28, { width: 280 });

    // Título Recibo a la derecha
    doc.fill('#FFF').font('Helvetica-Bold').fontSize(12)
      .text('RECIBO DE CAJA', R - 170, 12, { width: 170, align: 'right' });
    doc.fill('rgba(255,255,255,0.9)').font('Helvetica').fontSize(9)
      .text(`N° REC-${String(cita.id).padStart(5, '0')}`, R - 170, 28, { width: 170, align: 'right' });

    let y = 68;

    // Caja de datos del paciente
    doc.rect(L, y, W, 64).fill(BG_LT).stroke('#E2E8F0').lineWidth(0.5);

    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text('RECIBIDO DE:', L + 12, y + 8);
    doc.fill(TEXT).font('Helvetica-Bold').fontSize(11).text(cita.paciente_nombre || '—', L + 12, y + 19);
    doc.fill(GRAY).font('Helvetica').fontSize(8).text(`Doc. Identidad: ${cita.paciente_cedula || '—'}   ·   Tel: ${cita.paciente_telefono || '—'}`, L + 12, y + 34);
    if (cita.paciente_direccion) {
      doc.fill(GRAY).font('Helvetica').fontSize(7.5).text(`Dirección: ${cita.paciente_direccion}`, L + 12, y + 46);
    }

    // Datos fecha y médico
    const rxX = L + W * 0.6;
    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text('FECHA Y HORA DE PAGO:', rxX, y + 8);
    const fechaPago = cita.pagado_at ? new Date(cita.pagado_at).toLocaleString('es-ES') : new Date().toLocaleString('es-ES');
    doc.fill(TEXT).font('Helvetica').fontSize(9).text(fechaPago, rxX, y + 19);

    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text('ATENDIDO POR:', rxX, y + 34);
    doc.fill(TEXT).font('Helvetica').fontSize(8.5).text(`Dr./Dra. ${cita.doctor_nombre || '—'} (${cita.especialidad_nombre || 'Medicina General'})`, rxX, y + 45);

    y += 74;

    // Detalle de cobro
    doc.rect(L, y, W, 22).fill('#E8EDF5');
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(8.5).text('CONCEPTO / DESCRIPCIÓN', L + 10, y + 6, { width: W * 0.6 });
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(8.5).text('MÉTODO', L + W * 0.62, y + 6, { width: W * 0.18 });
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(8.5).text('VALOR PAGADO', R - 100, y + 6, { width: 90, align: 'right' });
    y += 22;

    doc.rect(L, y, W, 48).fill('#FFF').stroke('#E2E8F0').lineWidth(0.5);

    const concepto = `Consulta médica especializada - ${cita.motivo || 'Atención en consultorio'}`;
    doc.fill(TEXT).font('Helvetica').fontSize(9).text(concepto, L + 10, y + 10, { width: W * 0.6 });
    if (cita.notas_pago) {
      doc.fill(GRAY).font('Helvetica').fontSize(7.5).text(`Ref/Notas: ${cita.notas_pago}`, L + 10, y + 26, { width: W * 0.6 });
    }

    const isEx = cita.tipo_pago === 'cortesia' || cita.tipo_pago === 'familiar';
    const metodo = isEx ? `EXONERADO (${cita.tipo_pago.toUpperCase()})` : (cita.metodo_pago || 'efectivo').toUpperCase();
    doc.fill(TEXT).font('Helvetica-Bold').fontSize(8.5).text(metodo, L + W * 0.62, y + 12, { width: W * 0.18 });

    const valorFormateado = `$ ${(parseFloat(cita.costo) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(14).text(valorFormateado, R - 130, y + 14, { width: 120, align: 'right' });

    y += 62;

    // Total final
    doc.rect(R - 200, y, 200, 32).fill(BG_LT).stroke('#CBD5E1').lineWidth(0.5);
    doc.fill(GRAY).font('Helvetica-Bold').fontSize(8.5).text('TOTAL COBRADO:', R - 190, y + 10);
    doc.fill(ACCENT).font('Helvetica-Bold').fontSize(13).text(valorFormateado, R - 130, y + 8, { width: 120, align: 'right' });

    // Firmas
    const sigY = PH - 58;
    doc.moveTo(L + 20, sigY).lineTo(L + 180, sigY).lineWidth(0.5).stroke(GRAY);
    doc.fill(GRAY).font('Helvetica').fontSize(7.5).text('Firma Cajero / Autorizado', L + 20, sigY + 4, { width: 160, align: 'center' });

    doc.moveTo(R - 180, sigY).lineTo(R - 20, sigY).lineWidth(0.5).stroke(GRAY);
    doc.fill(GRAY).font('Helvetica').fontSize(7.5).text('Firma Paciente / Aceptación', R - 180, sigY + 4, { width: 160, align: 'center' });

    doc.fill('#94A3B8').font('Helvetica').fontSize(6.5).text('Comprobante válido para control interno de caja y constancia de pago del paciente.', L, PH - 14, { width: W, align: 'center' });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getByMonth, getByDate, getById, create, update,
  updateEstado, updateTipoPago, registrarCobro, remove,
  getResumenCaja, generateReciboPDF,
};
