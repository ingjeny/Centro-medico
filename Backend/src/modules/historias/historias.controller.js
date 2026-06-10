const model = require('./historias.model');
const PDFDocument = require('pdfkit');
const { getLogoPath, getFirmaPath } = require('./pdf.helper');

const getByPaciente = async (req, res) => {
  try { res.json(await model.getByPaciente(req.params.paciente_id)); }
  catch (err) { res.status(500).json({ message: err.message }); }
};

const getById = async (req, res) => {
  try {
    const historia = await model.getById(req.params.id);
    if (!historia) return res.status(404).json({ message: 'Historia no encontrada' });
    const medicamentos = await model.getMedicamentos(req.params.id);
    const incapacidades = await model.getIncapacidades(req.params.id);
    res.json({ ...historia, medicamentos, incapacidades });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const { medicamentos, ...historiaData } = req.body;
    historiaData.doctor_id = req.user.id;
    const id = await model.create(historiaData);
    if (medicamentos?.length) {
      for (const med of medicamentos) await model.addMedicamento({ ...med, historia_id: id });
    }
    res.status(201).json({ id, message: 'Historia clínica creada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    const { medicamentos, ...historiaData } = req.body;
    await model.update(req.params.id, historiaData);
    if (medicamentos !== undefined) {
      await model.deleteMedicamentos(req.params.id);
      for (const med of medicamentos) await model.addMedicamento({ ...med, historia_id: req.params.id });
    }
    res.json({ message: 'Historia actualizada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── PDF Historia Clínica ────────────────────────────────────────────────────

const generatePDF = async (req, res) => {
  try {
    const h = await model.getById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Historia no encontrada' });
    const meds = await model.getMedicamentos(req.params.id);

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=historia_${req.params.id}.pdf`);
    doc.pipe(res);

    // Colores y constantes
    const BLUE    = '#1B3A6B';
    const BLUE_LT = '#E8EDF5';
    const ACCENT  = '#2563EB';
    const GRAY    = '#64748B';
    const GRAY_LT = '#F8FAFC';
    const TEXT    = '#1E293B';
    const RED_BG  = '#FEF2F2';
    const RED_TX  = '#B91C1C';
    const L = 45;        // margen izquierdo
    const R = 550;       // margen derecho
    const W = R - L;     // ancho útil
    const PW = 595;      // ancho página A4

    const logoPath = getLogoPath();
    const firmaPath = getFirmaPath(h.doctor_id);

    // ── BANDA SUPERIOR ───────────────────────────────────────────────────────
    doc.rect(0, 0, PW, 72).fill(BLUE);

    // Logo (esquina superior izquierda, dentro de la banda)
    if (logoPath) {
      try { doc.image(logoPath, L, 10, { height: 52, fit: [130, 52] }); }
      catch (_) {}
    }

    // Título centrado (o a la derecha si hay logo)
    const titleX = logoPath ? 190 : L;
    const titleW = logoPath ? R - 190 : W;
    doc.fill('#FFFFFF').font('Helvetica-Bold').fontSize(18)
      .text('HISTORIA CLÍNICA', titleX, 20, { width: titleW, align: logoPath ? 'right' : 'center' });
    doc.fill('rgba(255,255,255,0.7)').font('Helvetica').fontSize(8.5)
      .text(
        `N° ${String(h.id).padStart(5, '0')}   ·   ${new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        titleX, 44, { width: titleW, align: logoPath ? 'right' : 'center' }
      );

    // ── BLOQUE PACIENTE + MÉDICO (fila horizontal) ───────────────────────────
    let y = 84;

    // Fondo ficha
    doc.rect(L, y, W, 52).fill(GRAY_LT).stroke('#E2E8F0').lineWidth(0.5);

    // Nombre paciente
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(12)
      .text(h.paciente_nombre || '—', L + 10, y + 8, { width: W * 0.55 });

    // Cédula y datos demográficos
    const demo = [
      h.cedula          && `CC: ${h.cedula}`,
      h.fecha_nacimiento && `Nac: ${new Date(h.fecha_nacimiento).toLocaleDateString('es-ES')}`,
      h.sexo             && (h.sexo === 'M' ? 'Masculino' : h.sexo === 'F' ? 'Femenino' : 'Otro'),
      h.tipo_sangre      && `GS: ${h.tipo_sangre}`,
      h.telefono         && `Tel: ${h.telefono}`,
    ].filter(Boolean).join('   ');
    doc.fill(GRAY).font('Helvetica').fontSize(8)
      .text(demo, L + 10, y + 24, { width: W * 0.55 });

    // Médico (columna derecha dentro del bloque)
    const mxL = L + W * 0.6;
    const mxW = W * 0.38;
    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5)
      .text('MÉDICO TRATANTE', mxL, y + 8, { width: mxW });
    doc.fill(TEXT).font('Helvetica').fontSize(9)
      .text(h.doctor_nombre || '—', mxL, y + 19, { width: mxW });
    if (h.especialidad) {
      doc.fill(GRAY).font('Helvetica').fontSize(8)
        .text(h.especialidad, mxL, y + 31, { width: mxW });
    }

    y += 60;

    // Alergias
    if (h.alergias) {
      doc.rect(L, y, W, 20).fill(RED_BG);
      doc.fill(RED_TX).font('Helvetica-Bold').fontSize(8.5)
        .text(`ALERGIAS: ${h.alergias}`, L + 10, y + 6, { width: W - 20 });
      y += 26;
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    const section = (title) => {
      y += 10;
      doc.rect(L, y, 3, 16).fill(ACCENT);
      doc.rect(L + 3, y, W - 3, 16).fill(BLUE_LT);
      doc.fill(BLUE).font('Helvetica-Bold').fontSize(8)
        .text(title.toUpperCase(), L + 12, y + 4, { width: W - 20 });
      y += 22;
    };

    const field = (label, value, opts = {}) => {
      if (!value && value !== 0) return;
      const indent = opts.indent || 0;
      const fW = opts.width || W - indent;
      doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5)
        .text(label.toUpperCase(), L + indent, y, { width: fW });
      y += 11;
      doc.fill(TEXT).font('Helvetica').fontSize(9)
        .text(String(value), L + indent, y, { width: fW, lineGap: 1.5 });
      const h2 = doc.heightOfString(String(value), { width: fW, lineGap: 1.5 });
      y += h2 + 8;
    };

    // ── SIGNOS VITALES ───────────────────────────────────────────────────────
    const sv = [
      { l: 'T. Arterial',  v: h.tension_arterial      ? `${h.tension_arterial} mmHg`  : null },
      { l: 'F. Cardíaca',  v: h.frecuencia_cardiaca   ? `${h.frecuencia_cardiaca} lpm` : null },
      { l: 'F. Resp.',     v: h.frecuencia_respiratoria ? `${h.frecuencia_respiratoria} rpm` : null },
      { l: 'Temperatura',  v: h.temperatura            ? `${h.temperatura} °C`         : null },
      { l: 'Peso',         v: h.peso                   ? `${h.peso} kg`                : null },
      { l: 'Talla',        v: h.talla                  ? `${h.talla} cm`               : null },
      { l: 'SatO₂',        v: h.saturacion_o2          ? `${h.saturacion_o2}%`         : null },
    ].filter(s => s.v);

    if (sv.length) {
      section('Signos Vitales');
      const cols = Math.min(sv.length, 4);
      const cellW = Math.floor(W / cols);
      const cellH = 36;

      sv.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = L + col * cellW;
        const cy = y + row * (cellH + 4);

        doc.rect(cx, cy, cellW - 4, cellH).fill('#FFFFFF').stroke('#E2E8F0').lineWidth(0.5);
        doc.fill(GRAY).font('Helvetica').fontSize(7).text(item.l, cx + 6, cy + 5, { width: cellW - 14 });
        doc.fill(BLUE).font('Helvetica-Bold').fontSize(11).text(item.v, cx + 6, cy + 16, { width: cellW - 14 });
      });

      const rows = Math.ceil(sv.length / cols);
      y += rows * (cellH + 4) + 6;
    }

    // ── CONSULTA MÉDICA ──────────────────────────────────────────────────────
    section('Consulta Médica');
    field('Motivo de consulta', h.motivo_consulta);
    field('Síntomas / Enfermedad actual', h.sintomas);
    field('Examen físico', h.examen_fisico);
    field('Diagnóstico', h.diagnostico);
    field('Tratamiento / Plan terapéutico', h.tratamiento);
    if (h.observaciones) field('Observaciones', h.observaciones);

    // ── MEDICAMENTOS ─────────────────────────────────────────────────────────
    if (meds.length) {
      section('Medicamentos Recetados');
      meds.forEach((m, i) => {
        // Numeración + nombre
        doc.rect(L, y, 18, 18).fill(BLUE);
        doc.fill('#fff').font('Helvetica-Bold').fontSize(8.5)
          .text(`${i + 1}`, L, y + 5, { width: 18, align: 'center' });

        doc.fill(TEXT).font('Helvetica-Bold').fontSize(9.5)
          .text(m.nombre, L + 22, y + 4, { width: W - 22 });
        y += 20;

        const meta = [
          m.dosis      && `Dosis: ${m.dosis}`,
          m.frecuencia && `Frecuencia: ${m.frecuencia}`,
          m.duracion   && `Duración: ${m.duracion}`,
        ].filter(Boolean).join('   ·   ');
        if (meta) {
          doc.fill(GRAY).font('Helvetica').fontSize(8.5).text(meta, L + 22, y, { width: W - 22 });
          y += 13;
        }
        if (m.indicaciones) {
          doc.fill(GRAY).font('Helvetica').fontSize(8)
            .text(`Indicaciones: ${m.indicaciones}`, L + 22, y, { width: W - 22, lineGap: 1 });
          y += doc.heightOfString(`Indicaciones: ${m.indicaciones}`, { width: W - 22 }) + 4;
        }
        y += 6;
      });
    }

    // ── ÁREA DE FIRMA (al fondo, posición fija) ──────────────────────────────
    const sigY = 755;  // posición fija desde arriba en A4 (841pt)

    doc.moveTo(L, sigY).lineTo(R, sigY).lineWidth(0.5).stroke('#E2E8F0');

    // Firma imagen (izquierda)
    if (firmaPath) {
      try { doc.image(firmaPath, L, sigY + 4, { height: 44, fit: [150, 44] }); }
      catch (_) {}
    }

    // Línea y nombre doctor (derecha)
    doc.moveTo(330, sigY + 48).lineTo(R, sigY + 48).lineWidth(0.5).stroke(GRAY);
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(9)
      .text(h.doctor_nombre || '—', 330, sigY + 51, { width: R - 330, align: 'center' });
    if (h.especialidad) {
      doc.fill(GRAY).font('Helvetica').fontSize(8)
        .text(h.especialidad, 330, sigY + 63, { width: R - 330, align: 'center' });
    }
    doc.fill(GRAY).font('Helvetica').fontSize(7.5)
      .text('Firma Médica', 330, h.especialidad ? sigY + 74 : sigY + 63, { width: R - 330, align: 'center' });

    // Pie de página
    doc.fill('#94A3B8').font('Helvetica').fontSize(7)
      .text(`Impreso: ${new Date().toLocaleString('es-ES')}`, L, 825, { width: W });

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getByPaciente, getById, create, update, generatePDF };
