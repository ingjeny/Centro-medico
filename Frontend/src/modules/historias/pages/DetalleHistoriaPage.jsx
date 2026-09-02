import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHistoria, createIncapacidad, deleteIncapacidad } from '../services/historias.service';
import useAuthStore from '../../../store/authStore';
import { API_URL } from '../../../api/axios';
import styles from './DetalleHistoriaPage.module.css';

const BASE = API_URL;
const token = () => localStorage.getItem('token');

const emptyIncap = {
  fecha_emision: new Date().toISOString().slice(0, 10),
  fecha_inicio: '', fecha_fin: '',
  diagnostico: '', tipo: 'reposo', observaciones: '',
};

export default function DetalleHistoriaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [historia, setHistoria] = useState(null);
  const [incapModal, setIncapModal] = useState(false);
  const [incapForm, setIncapForm] = useState(emptyIncap);
  const [loadingIncap, setLoadingIncap] = useState(false);

  const load = () => getHistoria(id).then(setHistoria);
  useEffect(() => { load(); }, [id]);

  if (!historia) return null;

  const isDoctor = ['admin', 'doctor'].includes(user?.rol);

  // calcular días automático
  const handleIncapChange = (e) => {
    const f = { ...incapForm, [e.target.name]: e.target.value };
    setIncapForm(f);
  };

  const calcDias = () => {
    if (!incapForm.fecha_inicio || !incapForm.fecha_fin) return 0;
    const d = Math.round((new Date(incapForm.fecha_fin) - new Date(incapForm.fecha_inicio)) / 86400000) + 1;
    return d > 0 ? d : 0;
  };

  const handleCreateIncap = async (e) => {
    e.preventDefault();
    setLoadingIncap(true);
    try {
      await createIncapacidad({
        ...incapForm,
        historia_id: id,
        paciente_id: historia.paciente_id,
        dias: calcDias(),
      });
      setIncapModal(false);
      setIncapForm(emptyIncap);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    } finally { setLoadingIncap(false); }
  };

  const handleDeleteIncap = async (incId) => {
    if (!confirm('¿Eliminar esta incapacidad?')) return;
    await deleteIncapacidad(incId);
    load();
  };

  const Section = ({ title, content }) => {
    if (!content) return null;
    return (
      <div className={styles.section}>
        <p className={styles.secLabel}>{title}</p>
        <p className={styles.secText}>{content}</p>
      </div>
    );
  };

  const sv = [
    { label: 'T.A.', value: historia.tension_arterial, unit: 'mmHg' },
    { label: 'F.C.', value: historia.frecuencia_cardiaca, unit: 'lpm' },
    { label: 'F.R.', value: historia.frecuencia_respiratoria, unit: 'rpm' },
    { label: 'Temperatura', value: historia.temperatura, unit: '°C' },
    { label: 'Peso', value: historia.peso, unit: 'kg' },
    { label: 'Talla', value: historia.talla, unit: 'cm' },
    { label: 'SatO2', value: historia.saturacion_o2, unit: '%' },
  ].filter(s => s.value);

  const TIPO_LABEL = {
    reposo: 'Reposo médico',
    incapacidad_laboral: 'Incapacidad laboral',
    reposo_relativo: 'Reposo relativo',
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Volver</button>
        <div className={styles.topActions}>
          {isDoctor && (
            <button className={styles.btnIncap} onClick={() => setIncapModal(true)}>
              + Incapacidad
            </button>
          )}
          <button className={styles.btnPrint}
            onClick={() => window.open(`${BASE}/historias/${id}/pdf?token=${token()}`, '_blank')}>
            Imprimir PDF
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHead}>
          <div>
            <p className={styles.hTitle}>Historia clínica #{id}</p>
            <p className={styles.hDate}>
              {new Date(historia.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className={styles.body}>
          {/* Paciente + Doctor */}
          <div className={styles.twoCol}>
            <div className={styles.infoBox}>
              <p className={styles.infoBoxLabel}>Paciente</p>
              <p className={styles.infoName}>{historia.paciente_nombre}</p>
              <p className={styles.infoDetail}>C.I. {historia.cedula}</p>
              {historia.fecha_nacimiento && <p className={styles.infoDetail}>{new Date(historia.fecha_nacimiento).toLocaleDateString('es-ES')}</p>}
              {historia.tipo_sangre && <p className={styles.infoDetail}>Sangre: <strong>{historia.tipo_sangre}</strong></p>}
              {historia.alergias && <div className={styles.alertBox}>Alergias: {historia.alergias}</div>}
            </div>
            <div className={styles.infoBox}>
              <p className={styles.infoBoxLabel}>Médico tratante</p>
              <p className={styles.infoName}>Dr./Dra. {historia.doctor_nombre}</p>
            </div>
          </div>

          {/* Signos vitales */}
          {sv.length > 0 && (
            <div className={styles.section}>
              <p className={styles.secLabel}>Signos vitales</p>
              <div className={styles.svGrid}>
                {sv.map(s => (
                  <div key={s.label} className={styles.svCard}>
                    <p className={styles.svLabel}>{s.label}</p>
                    <p className={styles.svValue}>{s.value} <span className={styles.svUnit}>{s.unit}</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Section title="Motivo de consulta" content={historia.motivo_consulta} />
          <Section title="Síntomas / Enfermedad actual" content={historia.sintomas} />
          <Section title="Examen físico" content={historia.examen_fisico} />
          <Section title="Diagnóstico" content={historia.diagnostico} />
          <Section title="Tratamiento / Plan" content={historia.tratamiento} />
          <Section title="Observaciones" content={historia.observaciones} />

          {/* Medicamentos */}
          {historia.medicamentos?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.secLabel}>Medicamentos recetados</p>
              <div className={styles.medList}>
                {historia.medicamentos.map((m, i) => (
                  <div key={m.id} className={styles.medItem}>
                    <div className={styles.medNum}>{i + 1}</div>
                    <div>
                      <p className={styles.medName}>{m.nombre}</p>
                      <div className={styles.medTags}>
                        {m.dosis && <span className={styles.medTag}>{m.dosis}</span>}
                        {m.frecuencia && <span className={styles.medTag}>{m.frecuencia}</span>}
                        {m.duracion && <span className={styles.medTag}>{m.duracion}</span>}
                        {m.indicaciones && <span className={styles.medTagNote}>{m.indicaciones}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incapacidades */}
          {historia.incapacidades?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.incapHead}>
                <p className={styles.secLabel}>Incapacidades / Reposos</p>
              </div>
              <div className={styles.incapList}>
                {historia.incapacidades.map(inc => (
                  <div key={inc.id} className={styles.incapCard}>
                    <div className={styles.incapDias}>
                      <span>{inc.dias}</span>
                      <small>{inc.dias === 1 ? 'día' : 'días'}</small>
                    </div>
                    <div className={styles.incapData}>
                      <p className={styles.incapTipo}>{TIPO_LABEL[inc.tipo] || inc.tipo}</p>
                      <p className={styles.incapPeriod}>
                        {new Date(inc.fecha_inicio).toLocaleDateString('es-ES')} — {new Date(inc.fecha_fin).toLocaleDateString('es-ES')}
                      </p>
                      {inc.diagnostico && <p className={styles.incapDiag}>{inc.diagnostico}</p>}
                    </div>
                    <div className={styles.incapActions}>
                      <button className={styles.btnPDF}
                        onClick={() => window.open(`${BASE}/incapacidades/${inc.id}/pdf?token=${token()}`, '_blank')}>
                        PDF
                      </button>
                      {isDoctor && (
                        <button className={styles.btnDel} onClick={() => handleDeleteIncap(inc.id)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal incapacidad */}
      {incapModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Nueva incapacidad / reposo</h2>
              <button className={styles.closeBtn} onClick={() => setIncapModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateIncap} className={styles.incapForm}>
              <div className={styles.field}>
                <label>Tipo *</label>
                <select name="tipo" value={incapForm.tipo} onChange={handleIncapChange}>
                  <option value="reposo">Reposo médico</option>
                  <option value="incapacidad_laboral">Incapacidad laboral</option>
                  <option value="reposo_relativo">Reposo relativo</option>
                </select>
              </div>
              <div className={styles.grid3}>
                <div className={styles.field}>
                  <label>Fecha emisión</label>
                  <input type="date" name="fecha_emision" value={incapForm.fecha_emision} onChange={handleIncapChange} required />
                </div>
                <div className={styles.field}>
                  <label>Fecha inicio *</label>
                  <input type="date" name="fecha_inicio" value={incapForm.fecha_inicio} onChange={handleIncapChange} required />
                </div>
                <div className={styles.field}>
                  <label>Fecha fin *</label>
                  <input type="date" name="fecha_fin" value={incapForm.fecha_fin} onChange={handleIncapChange} required />
                </div>
              </div>
              {calcDias() > 0 && (
                <div className={styles.diasBadge}>
                  <strong>{calcDias()}</strong> {calcDias() === 1 ? 'día' : 'días'}
                </div>
              )}
              <div className={styles.field}>
                <label>Diagnóstico</label>
                <textarea name="diagnostico" value={incapForm.diagnostico} onChange={handleIncapChange} rows={2}
                  placeholder="Diagnóstico o motivo del reposo" />
              </div>
              <div className={styles.field}>
                <label>Observaciones</label>
                <textarea name="observaciones" value={incapForm.observaciones} onChange={handleIncapChange} rows={2}
                  placeholder="Restricciones, indicaciones especiales, etc." />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setIncapModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSave} disabled={loadingIncap}>
                  {loadingIncap ? 'Guardando...' : 'Emitir incapacidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
