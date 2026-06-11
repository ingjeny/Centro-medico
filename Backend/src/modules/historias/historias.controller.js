const model = require('./historias.model');
const PDFDocument = require('pdfkit');
const { getLogoPath, getFirmaPath } = require('./pdf.helper');

const getByPaciente = async (req, res) => {
  try { res.json(await model.getByPaciente(req.params.paciente_id, req.user)); }
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
    const id = await model.create(historiaData, req.user);
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

    const BLUE = '#1B3A6B', BLUE_LT = '#E8EDF5', ACCENT = '#2563EB';
    const GRAY = '#64748B', GRAY_LT = '#F8FAFC', TEXT = '#1E293B';
    const L = 45, R = 550, W = R - L, PW = 595;

    const logoPath = getLogoPath();
    const firmaPath = getFirmaPath(h.doctor_id);

    // ── Header ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, PW, 72).fill(BLUE);
    if (logoPath) { try { doc.image(logoPath, L, 10, { height: 52, fit: [130, 52] }); } catch (_) {} }
    const titleX = logoPath ? 190 : L;
    const titleW = logoPath ? R - 190 : W;
    doc.fill('#FFF').font('Helvetica-Bold').fontSize(18).text('HISTORIA CLÍNICA', titleX, 20, { width: titleW, align: logoPath ? 'right' : 'center' });
    doc.fill('rgba(255,255,255,0.7)').font('Helvetica').fontSize(8.5)
      .text(`N° ${String(h.id).padStart(5,'0')}   ·   ${new Date(h.fecha).toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'})}`, titleX, 44, { width: titleW, align: logoPath ? 'right' : 'center' });

    // ── Ficha paciente ───────────────────────────────────────────────────────
    let y = 84;
    doc.rect(L, y, W, 52).fill(GRAY_LT).stroke('#E2E8F0').lineWidth(0.5);
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(12).text(h.paciente_nombre || '—', L+10, y+8, { width: W*0.55 });
    const demo = [h.cedula&&`CC: ${h.cedula}`, h.fecha_nacimiento&&`Nac: ${new Date(h.fecha_nacimiento).toLocaleDateString('es-ES')}`,
      h.sexo&&(h.sexo==='M'?'Masculino':h.sexo==='F'?'Femenino':'Otro'), h.tipo_sangre&&`GS: ${h.tipo_sangre}`, h.telefono&&`Tel: ${h.telefono}`].filter(Boolean).join('   ');
    doc.fill(GRAY).font('Helvetica').fontSize(8).text(demo, L+10, y+24, { width: W*0.55 });
    const mxL = L+W*0.6, mxW = W*0.38;
    doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text('MÉDICO TRATANTE', mxL, y+8, { width: mxW });
    doc.fill(TEXT).font('Helvetica').fontSize(9).text(h.doctor_nombre||'—', mxL, y+19, { width: mxW });
    if (h.especialidad_nombre) doc.fill(GRAY).font('Helvetica').fontSize(8).text(h.especialidad_nombre, mxL, y+31, { width: mxW });
    y += 60;

    if (h.alergias) {
      doc.rect(L, y, W, 20).fill('#FEF2F2');
      doc.fill('#B91C1C').font('Helvetica-Bold').fontSize(8.5).text(`ALERGIAS: ${h.alergias}`, L+10, y+6, { width: W-20 });
      y += 26;
    }

    const section = (title) => { y+=10; doc.rect(L,y,3,16).fill(ACCENT); doc.rect(L+3,y,W-3,16).fill(BLUE_LT); doc.fill(BLUE).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(),L+12,y+4,{width:W-20}); y+=22; };
    const field = (label, value) => {
      if (!value && value !== 0) return;
      doc.fill(GRAY).font('Helvetica-Bold').fontSize(7.5).text(label.toUpperCase(), L, y, {width:W}); y+=11;
      doc.fill(TEXT).font('Helvetica').fontSize(9).text(String(value), L, y, {width:W, lineGap:1.5});
      y += doc.heightOfString(String(value),{width:W,lineGap:1.5})+8;
    };

    // ── Signos vitales ───────────────────────────────────────────────────────
    const sv = [
      {l:'T. Arterial', v:h.tension_arterial?`${h.tension_arterial} mmHg`:null},
      {l:'F. Cardíaca', v:h.frecuencia_cardiaca?`${h.frecuencia_cardiaca} lpm`:null},
      {l:'F. Resp.', v:h.frecuencia_respiratoria?`${h.frecuencia_respiratoria} rpm`:null},
      {l:'Temperatura', v:h.temperatura?`${h.temperatura} °C`:null},
      {l:'Peso', v:h.peso?`${h.peso} kg`:null},
      {l:'Talla', v:h.talla?`${h.talla} cm`:null},
      {l:'SatO₂', v:h.saturacion_o2?`${h.saturacion_o2}%`:null},
    ].filter(s=>s.v);
    if (sv.length) {
      section('Signos Vitales');
      const cols=Math.min(sv.length,4), cellW=Math.floor(W/cols), cellH=36;
      sv.forEach((item,i)=>{
        const col=i%cols, row=Math.floor(i/cols), cx=L+col*cellW, cy=y+row*(cellH+4);
        doc.rect(cx,cy,cellW-4,cellH).fill('#FFF').stroke('#E2E8F0').lineWidth(0.5);
        doc.fill(GRAY).font('Helvetica').fontSize(7).text(item.l,cx+6,cy+5,{width:cellW-14});
        doc.fill(BLUE).font('Helvetica-Bold').fontSize(11).text(item.v,cx+6,cy+16,{width:cellW-14});
      });
      y += Math.ceil(sv.length/cols)*(cellH+4)+6;
    }

    // ── Campos extra de especialidad ─────────────────────────────────────────
    if (h.datos_extra && typeof h.datos_extra === 'object' && Object.keys(h.datos_extra).length) {
      section(h.especialidad_nombre ? `Datos de ${h.especialidad_nombre}` : 'Datos específicos');
      Object.entries(h.datos_extra).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return;
        const label = k.replace(/_/g, ' ');
        field(label, typeof v === 'boolean' ? (v ? 'Sí' : 'No') : String(v));
      });
    }

    // ── Consulta ─────────────────────────────────────────────────────────────
    section('Consulta Médica');
    field('Motivo de consulta', h.motivo_consulta);
    field('Síntomas / Enfermedad actual', h.sintomas);
    field('Examen físico', h.examen_fisico);
    field('Diagnóstico', h.diagnostico);
    field('Tratamiento / Plan terapéutico', h.tratamiento);
    if (h.observaciones) field('Observaciones', h.observaciones);

    // ── Medicamentos ─────────────────────────────────────────────────────────
    if (meds.length) {
      section('Medicamentos Recetados');
      meds.forEach((m, i) => {
        doc.rect(L, y, 18, 18).fill(BLUE);
        doc.fill('#fff').font('Helvetica-Bold').fontSize(8.5).text(`${i+1}`, L, y+5, {width:18,align:'center'});
        doc.fill(TEXT).font('Helvetica-Bold').fontSize(9.5).text(m.nombre, L+22, y+4, {width:W-22});
        y += 20;
        const meta=[m.dosis&&`Dosis: ${m.dosis}`, m.frecuencia&&`Frecuencia: ${m.frecuencia}`, m.duracion&&`Duración: ${m.duracion}`].filter(Boolean).join('   ·   ');
        if (meta) { doc.fill(GRAY).font('Helvetica').fontSize(8.5).text(meta, L+22, y, {width:W-22}); y+=13; }
        if (m.indicaciones) { doc.fill(GRAY).font('Helvetica').fontSize(8).text(`Ind: ${m.indicaciones}`, L+22, y, {width:W-22}); y+=12; }
        y += 6;
      });
    }

    // ── Firma ────────────────────────────────────────────────────────────────
    const sigY = 755;
    doc.moveTo(L, sigY).lineTo(R, sigY).lineWidth(0.5).stroke('#E2E8F0');
    if (firmaPath) { try { doc.image(firmaPath, L, sigY+4, {height:44,fit:[150,44]}); } catch (_) {} }
    doc.moveTo(330, sigY+48).lineTo(R, sigY+48).lineWidth(0.5).stroke(GRAY);
    doc.fill(BLUE).font('Helvetica-Bold').fontSize(9).text(h.doctor_nombre||'—', 330, sigY+51, {width:R-330,align:'center'});
    if (h.especialidad_nombre) doc.fill(GRAY).font('Helvetica').fontSize(8).text(h.especialidad_nombre, 330, sigY+63, {width:R-330,align:'center'});
    doc.fill(GRAY).font('Helvetica').fontSize(7.5).text('Firma Médica', 330, sigY+(h.especialidad_nombre?74:63), {width:R-330,align:'center'});
    doc.fill('#94A3B8').font('Helvetica').fontSize(7).text(`Impreso: ${new Date().toLocaleString('es-ES')}`, L, 825, {width:W});

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getByPaciente, getById, create, update, generatePDF };
