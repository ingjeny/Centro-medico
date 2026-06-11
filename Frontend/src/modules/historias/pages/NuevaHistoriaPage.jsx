import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPaciente } from '../../pacientes/services/pacientes.service';
import { createHistoria } from '../services/historias.service';
import { getCampos } from '../../especialidades/services/especialidades.service';
import useAuthStore from '../../../store/authStore';
import api from '../../../api/axios';
import styles from './NuevaHistoriaPage.module.css';

const emptyMed = { nombre: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' };

const emptyForm = {
  paciente_id: '', fecha: new Date().toISOString().slice(0, 10),
  tension_arterial: '', frecuencia_cardiaca: '', frecuencia_respiratoria: '',
  temperatura: '', peso: '', talla: '', saturacion_o2: '',
  motivo_consulta: '', sintomas: '', examen_fisico: '',
  diagnostico: '', tratamiento: '', observaciones: '',
};

// ── Renderiza un campo dinámico ───────────────────────────────────────────────
function CampoDinamico({ campo, value, onChange }) {
  const label = (
    <label>
      {campo.etiqueta}
      {campo.requerido && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      {campo.unidad && <span style={{ color: 'var(--text-3)', fontSize: 12, marginLeft: 5 }}>{campo.unidad}</span>}
    </label>
  );

  if (campo.tipo === 'textarea') return (
    <div className={styles.field}>
      {label}
      <textarea rows={3} value={value || ''} onChange={e => onChange(campo.nombre, e.target.value)}
        required={!!campo.requerido} placeholder={campo.etiqueta} className={styles.textarea} />
    </div>
  );

  if (campo.tipo === 'select') return (
    <div className={styles.field}>
      {label}
      <select value={value || ''} onChange={e => onChange(campo.nombre, e.target.value)} required={!!campo.requerido}>
        <option value="">Seleccionar...</option>
        {(campo.opciones || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (campo.tipo === 'checkbox') return (
    <div className={styles.field}>
      <label className={styles.checkLabel}>
        <input type="checkbox" checked={!!value} onChange={e => onChange(campo.nombre, e.target.checked)} />
        {campo.etiqueta}
      </label>
    </div>
  );

  if (campo.tipo === 'fecha') return (
    <div className={styles.field}>
      {label}
      <input type="date" value={value || ''} onChange={e => onChange(campo.nombre, e.target.value)} required={!!campo.requerido} />
    </div>
  );

  // texto / numero
  return (
    <div className={styles.field}>
      {label}
      <input
        type={campo.tipo === 'numero' ? 'number' : 'text'}
        value={value || ''} onChange={e => onChange(campo.nombre, e.target.value)}
        required={!!campo.requerido} placeholder={campo.etiqueta}
        step={campo.tipo === 'numero' ? 'any' : undefined}
      />
    </div>
  );
}

export default function NuevaHistoriaPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuthStore();
  const pacienteId = params.get('paciente_id');

  const [paciente, setPaciente]       = useState(null);
  const [form, setForm]               = useState({ ...emptyForm, paciente_id: pacienteId || '' });
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading]         = useState(false);

  // Especialidad del doctor
  const [camposEsp, setCamposEsp]     = useState([]);  // [{seccion, campos:[]}]
  const [datosExtra, setDatosExtra]   = useState({});
  const [espNombre, setEspNombre]     = useState('');

  useEffect(() => {
    if (pacienteId) getPaciente(pacienteId).then(setPaciente);
  }, [pacienteId]);

  // Cargar campos de la especialidad del doctor logueado
  useEffect(() => {
    api.get('/usuarios/me').then(async r => {
      const me = r.data;
      if (me.especialidad_id) {
        setEspNombre(me.especialidad_nombre || me.especialidad || '');
        const campos = await getCampos(me.especialidad_id);
        // agrupar por sección
        const grupos = campos.reduce((acc, c) => {
          const s = c.seccion || 'Datos específicos';
          if (!acc[s]) acc[s] = [];
          acc[s].push(c);
          return acc;
        }, {});
        setCamposEsp(Object.entries(grupos).map(([seccion, campos]) => ({ seccion, campos })));
      }
    }).catch(() => {});
  }, []);

  const setF = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const setExtra = (key, val) => setDatosExtra(d => ({ ...d, [key]: val }));

  const addMed    = () => setMedicamentos(m => [...m, { ...emptyMed }]);
  const removeMed = i  => setMedicamentos(m => m.filter((_, idx) => idx !== i));
  const setMed = (i, e) => setMedicamentos(m => {
    const c = [...m]; c[i] = { ...c[i], [e.target.name]: e.target.value }; return c;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        medicamentos,
        datos_extra: Object.keys(datosExtra).length ? datosExtra : null,
      };
      const res = await createHistoria(payload);
      navigate(`/historias/${res.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Volver</button>
        <h1>Nueva historia clínica</h1>
      </div>

      {paciente && (
        <div className={styles.patientBanner}>
          <div className={styles.bannerAvatar}>{paciente.nombre[0]}{paciente.apellido[0]}</div>
          <div>
            <strong>{paciente.nombre} {paciente.apellido}</strong>
            <span>C.I. {paciente.cedula}</span>
            {paciente.tipo_sangre && <span>Sangre {paciente.tipo_sangre}</span>}
          </div>
          {paciente.alergias && (
            <div className={styles.alertPill}>Alergias: {paciente.alergias}</div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>

        {/* Fecha */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Datos de la consulta</p>
          <div className={styles.grid4}>
            <div className={styles.field}>
              <label>Fecha *</label>
              <input type="date" name="fecha" value={form.fecha} onChange={setF} required />
            </div>
          </div>
        </div>

        {/* Signos vitales */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Signos vitales</p>
          <div className={styles.grid4}>
            <div className={styles.field}><label>T.A. (mmHg)</label><input name="tension_arterial" value={form.tension_arterial} onChange={setF} placeholder="120/80" /></div>
            <div className={styles.field}><label>F.C. (lpm)</label><input name="frecuencia_cardiaca" value={form.frecuencia_cardiaca} onChange={setF} placeholder="72" /></div>
            <div className={styles.field}><label>F.R. (rpm)</label><input name="frecuencia_respiratoria" value={form.frecuencia_respiratoria} onChange={setF} placeholder="16" /></div>
            <div className={styles.field}><label>Temperatura (°C)</label><input name="temperatura" value={form.temperatura} onChange={setF} placeholder="36.5" /></div>
            <div className={styles.field}><label>Peso (kg)</label><input name="peso" value={form.peso} onChange={setF} placeholder="70" /></div>
            <div className={styles.field}><label>Talla (cm)</label><input name="talla" value={form.talla} onChange={setF} placeholder="170" /></div>
            <div className={styles.field}><label>SatO2 (%)</label><input name="saturacion_o2" value={form.saturacion_o2} onChange={setF} placeholder="98" /></div>
          </div>
        </div>

        {/* Campos dinámicos de la especialidad */}
        {camposEsp.length > 0 && camposEsp.map(({ seccion, campos }) => (
          <div key={seccion} className={styles.section}>
            <p className={styles.sectionTitle}>
              {seccion}
              {espNombre && <span className={styles.espTag}>{espNombre}</span>}
            </p>
            <div className={styles.camposDinamicos}>
              {campos.map(c => (
                <CampoDinamico
                  key={c.id}
                  campo={c}
                  value={datosExtra[c.nombre]}
                  onChange={setExtra}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Anamnesis */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Anamnesis y exploración</p>
          <div className={styles.field}>
            <label>Motivo de consulta *</label>
            <textarea name="motivo_consulta" value={form.motivo_consulta} onChange={setF} rows={2} required placeholder="¿Por qué viene el paciente?" className={styles.textarea} />
          </div>
          <div className={styles.field}>
            <label>Síntomas / Enfermedad actual</label>
            <textarea name="sintomas" value={form.sintomas} onChange={setF} rows={3} placeholder="Describir evolución y síntomas" className={styles.textarea} />
          </div>
          <div className={styles.field}>
            <label>Examen físico</label>
            <textarea name="examen_fisico" value={form.examen_fisico} onChange={setF} rows={3} placeholder="Hallazgos del examen físico" className={styles.textarea} />
          </div>
        </div>

        {/* Diagnóstico */}
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Diagnóstico y tratamiento</p>
          <div className={styles.field}>
            <label>Diagnóstico</label>
            <textarea name="diagnostico" value={form.diagnostico} onChange={setF} rows={2} placeholder="CIE-10 o diagnóstico clínico" className={styles.textarea} />
          </div>
          <div className={styles.field}>
            <label>Tratamiento / Plan</label>
            <textarea name="tratamiento" value={form.tratamiento} onChange={setF} rows={2} placeholder="Plan de manejo y seguimiento" className={styles.textarea} />
          </div>
          <div className={styles.field}>
            <label>Observaciones</label>
            <textarea name="observaciones" value={form.observaciones} onChange={setF} rows={2} placeholder="Notas adicionales" className={styles.textarea} />
          </div>
        </div>

        {/* Medicamentos */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <p className={styles.sectionTitle}>Medicamentos recetados</p>
            <button type="button" className={styles.btnAdd} onClick={addMed}>+ Agregar</button>
          </div>
          {medicamentos.length === 0 && (
            <p className={styles.emptyMeds}>Sin medicamentos. Clic en "+ Agregar" para añadir.</p>
          )}
          {medicamentos.map((med, i) => (
            <div key={i} className={styles.medCard}>
              <div className={styles.medCardHead}>
                <span className={styles.medNum}>{i + 1}</span>
                <button type="button" className={styles.btnRemove} onClick={() => removeMed(i)}>Eliminar</button>
              </div>
              <div className={styles.medGrid}>
                <div className={`${styles.field} ${styles.span2}`}>
                  <label>Medicamento *</label>
                  <input name="nombre" value={med.nombre} onChange={e => setMed(i, e)} required placeholder="Nombre del medicamento" />
                </div>
                <div className={styles.field}><label>Dosis</label><input name="dosis" value={med.dosis} onChange={e => setMed(i, e)} placeholder="ej: 500 mg" /></div>
                <div className={styles.field}><label>Frecuencia</label><input name="frecuencia" value={med.frecuencia} onChange={e => setMed(i, e)} placeholder="ej: cada 8 horas" /></div>
                <div className={styles.field}><label>Duración</label><input name="duracion" value={med.duracion} onChange={e => setMed(i, e)} placeholder="ej: 7 días" /></div>
                <div className={`${styles.field} ${styles.span2}`}>
                  <label>Indicaciones</label>
                  <input name="indicaciones" value={med.indicaciones} onChange={e => setMed(i, e)} placeholder="Tomar con comida, etc." />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formFooter}>
          <button type="button" className={styles.btnCancel} onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar historia clínica'}
          </button>
        </div>
      </form>
    </div>
  );
}
