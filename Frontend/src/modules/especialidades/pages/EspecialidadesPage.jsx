import { useState, useEffect } from 'react';
import {
  getEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad,
  getCampos, createCampo, updateCampo, deleteCampo,
} from '../services/especialidades.service';
import styles from './EspecialidadesPage.module.css';

const TIPO_LABELS = {
  texto: 'Texto corto', textarea: 'Texto largo', numero: 'Número',
  select: 'Lista opciones', checkbox: 'Sí / No', fecha: 'Fecha',
};

const TIPO_ICONS = {
  texto: 'T', textarea: '¶', numero: '#', select: '☰', checkbox: '✓', fecha: '📅',
};

const COLORES = ['#6366f1','#ec4899','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6'];

const EMPTY_ESP  = { nombre: '', descripcion: '', color: '#6366f1' };
const EMPTY_CAMPO = { etiqueta: '', nombre: '', tipo: 'texto', opciones: '', unidad: '', seccion: 'Datos específicos', requerido: false };

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const toSnake = (str) => str.toLowerCase().replace(/[áéíóú]/g, c => ({á:'a',é:'e',í:'i',ó:'o',ú:'u'}[c]))
  .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export default function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [selected, setSelected]   = useState(null);   // especialidad activa
  const [campos, setCampos]        = useState([]);

  const [modalEsp, setModalEsp]   = useState(false);
  const [editEsp, setEditEsp]     = useState(null);    // null = nuevo
  const [formEsp, setFormEsp]     = useState(EMPTY_ESP);

  const [modalCampo, setModalCampo] = useState(false);
  const [editCampo, setEditCampo]   = useState(null);
  const [formCampo, setFormCampo]   = useState(EMPTY_CAMPO);

  const [saving, setSaving] = useState(false);

  const load = async () => {
    const data = await getEspecialidades();
    setEspecialidades(data);
    if (selected) {
      const found = data.find(e => e.id === selected.id);
      if (found) setSelected(found);
    }
  };

  const loadCampos = async (espId) => setCampos(await getCampos(espId));

  useEffect(() => { load(); }, []);
  useEffect(() => { if (selected) loadCampos(selected.id); }, [selected?.id]);

  // ── Especialidad ──────────────────────────────────────────────────────────
  const openNewEsp = () => { setEditEsp(null); setFormEsp(EMPTY_ESP); setModalEsp(true); };
  const openEditEsp = (e) => { setEditEsp(e); setFormEsp({ nombre: e.nombre, descripcion: e.descripcion || '', color: e.color }); setModalEsp(true); };

  const saveEsp = async () => {
    setSaving(true);
    try {
      if (editEsp) await updateEspecialidad(editEsp.id, formEsp);
      else await createEspecialidad(formEsp);
      setModalEsp(false);
      await load();
    } finally { setSaving(false); }
  };

  const removeEsp = async (e) => {
    if (!confirm(`¿Eliminar especialidad "${e.nombre}"? Se desvinculará de todos los doctores.`)) return;
    await deleteEspecialidad(e.id);
    if (selected?.id === e.id) setSelected(null);
    load();
  };

  // ── Campo ─────────────────────────────────────────────────────────────────
  const openNewCampo = () => { setEditCampo(null); setFormCampo(EMPTY_CAMPO); setModalCampo(true); };
  const openEditCampo = (c) => {
    setEditCampo(c);
    setFormCampo({
      etiqueta: c.etiqueta, nombre: c.nombre, tipo: c.tipo,
      opciones: Array.isArray(c.opciones) ? c.opciones.join('\n') : '',
      unidad: c.unidad || '', seccion: c.seccion, requerido: !!c.requerido,
    });
    setModalCampo(true);
  };

  const saveCampo = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formCampo,
        nombre: formCampo.nombre || toSnake(formCampo.etiqueta),
        opciones: formCampo.tipo === 'select'
          ? formCampo.opciones.split('\n').map(s => s.trim()).filter(Boolean)
          : null,
      };
      if (editCampo) await updateCampo(selected.id, editCampo.id, payload);
      else           await createCampo(selected.id, payload);
      setModalCampo(false);
      loadCampos(selected.id);
    } finally { setSaving(false); }
  };

  const removeCampo = async (c) => {
    if (!confirm(`¿Eliminar campo "${c.etiqueta}"?`)) return;
    await deleteCampo(selected.id, c.id);
    loadCampos(selected.id);
  };

  // Agrupar campos por sección
  const secciones = campos.reduce((acc, c) => {
    (acc[c.seccion] = acc[c.seccion] || []).push(c);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Especialidades</h1>
          <p className={styles.sub}>Configura las especialidades y sus campos personalizados en la historia clínica</p>
        </div>
        <button className={styles.btnNew} onClick={openNewEsp}>+ Nueva especialidad</button>
      </div>

      <div className={styles.layout}>
        {/* ── Lista de especialidades ──────────────────────────────────────── */}
        <div className={styles.leftPanel}>
          {especialidades.length === 0 && (
            <div className={styles.empty}>No hay especialidades aún</div>
          )}
          {especialidades.map(e => (
            <div
              key={e.id}
              className={`${styles.espCard} ${selected?.id === e.id ? styles.espActive : ''}`}
              onClick={() => setSelected(e)}
            >
              <div className={styles.espDot} style={{ background: e.color }} />
              <div className={styles.espInfo}>
                <span className={styles.espNombre}>{e.nombre}</span>
                <span className={styles.espMeta}>{e.doctores_count || 0} doctor(es)</span>
              </div>
              <div className={styles.espActions}>
                <button className={styles.iconBtn} onClick={ev => { ev.stopPropagation(); openEditEsp(e); }} title="Editar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button className={`${styles.iconBtn} ${styles.danger}`} onClick={ev => { ev.stopPropagation(); removeEsp(e); }} title="Eliminar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Detalle / campos ─────────────────────────────────────────────── */}
        <div className={styles.rightPanel}>
          {!selected ? (
            <div className={styles.selectHint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p>Selecciona una especialidad para configurar sus campos</p>
            </div>
          ) : (
            <>
              <div className={styles.panelHead}>
                <div className={styles.panelTitle}>
                  <span className={styles.espDot} style={{ background: selected.color }} />
                  <strong>{selected.nombre}</strong>
                  {selected.descripcion && <span className={styles.panelDesc}>{selected.descripcion}</span>}
                </div>
                <button className={styles.btnNew} onClick={openNewCampo}>+ Agregar campo</button>
              </div>

              <p className={styles.camposHint}>
                Estos campos aparecerán en la historia clínica cuando el doctor tenga asignada esta especialidad.
              </p>

              {Object.keys(secciones).length === 0 ? (
                <div className={styles.empty}>No hay campos configurados. Agrega el primero.</div>
              ) : (
                Object.entries(secciones).map(([seccion, items]) => (
                  <div key={seccion} className={styles.seccionGroup}>
                    <div className={styles.seccionLabel}>{seccion}</div>
                    {items.map(c => (
                      <div key={c.id} className={styles.campoRow}>
                        <div className={styles.campoTipo} title={TIPO_LABELS[c.tipo]}>
                          {TIPO_ICONS[c.tipo]}
                        </div>
                        <div className={styles.campoInfo}>
                          <span className={styles.campoEtiqueta}>
                            {c.etiqueta}
                            {c.requerido && <span className={styles.req}>*</span>}
                            {c.unidad && <span className={styles.unidad}>{c.unidad}</span>}
                          </span>
                          <span className={styles.campoNombre}>{c.nombre} · {TIPO_LABELS[c.tipo]}</span>
                          {c.tipo === 'select' && c.opciones && (
                            <span className={styles.opciones}>{c.opciones.join(' / ')}</span>
                          )}
                        </div>
                        <div className={styles.espActions}>
                          <button className={styles.iconBtn} onClick={() => openEditCampo(c)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => removeCampo(c)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Modal especialidad ────────────────────────────────────────────────── */}
      {modalEsp && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>{editEsp ? 'Editar especialidad' : 'Nueva especialidad'}</h2>
              <button className={styles.closeBtn} onClick={() => setModalEsp(false)}><CloseIcon /></button>
            </div>
            <div className={styles.form}>
              <div className={styles.field}>
                <label>Nombre *</label>
                <input value={formEsp.nombre} onChange={e => setFormEsp({ ...formEsp, nombre: e.target.value })} placeholder="ej: Cardiología" />
              </div>
              <div className={styles.field}>
                <label>Descripción</label>
                <input value={formEsp.descripcion} onChange={e => setFormEsp({ ...formEsp, descripcion: e.target.value })} placeholder="Descripción breve" />
              </div>
              <div className={styles.field}>
                <label>Color de identificación</label>
                <div className={styles.colorPicker}>
                  {COLORES.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.colorBtn} ${formEsp.color === c ? styles.colorSelected : ''}`}
                      style={{ background: c }}
                      onClick={() => setFormEsp({ ...formEsp, color: c })}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnCancel} onClick={() => setModalEsp(false)}>Cancelar</button>
                <button className={styles.btnSave} onClick={saveEsp} disabled={!formEsp.nombre || saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal campo ───────────────────────────────────────────────────────── */}
      {modalCampo && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ maxWidth: 520 }}>
            <div className={styles.modalHead}>
              <h2>{editCampo ? 'Editar campo' : 'Nuevo campo'}</h2>
              <button className={styles.closeBtn} onClick={() => setModalCampo(false)}><CloseIcon /></button>
            </div>
            <div className={styles.form}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Etiqueta (visible) *</label>
                  <input
                    value={formCampo.etiqueta}
                    onChange={e => setFormCampo({
                      ...formCampo,
                      etiqueta: e.target.value,
                      nombre: editCampo ? formCampo.nombre : toSnake(e.target.value),
                    })}
                    placeholder="ej: Última menstruación"
                  />
                </div>
                <div className={styles.field}>
                  <label>Clave interna</label>
                  <input
                    value={formCampo.nombre}
                    onChange={e => setFormCampo({ ...formCampo, nombre: e.target.value })}
                    placeholder="auto"
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Tipo *</label>
                  <select value={formCampo.tipo} onChange={e => setFormCampo({ ...formCampo, tipo: e.target.value })}>
                    {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Sección</label>
                  <input value={formCampo.seccion} onChange={e => setFormCampo({ ...formCampo, seccion: e.target.value })} placeholder="Datos específicos" />
                </div>
              </div>

              {formCampo.tipo === 'numero' && (
                <div className={styles.field}>
                  <label>Unidad (opcional)</label>
                  <input value={formCampo.unidad} onChange={e => setFormCampo({ ...formCampo, unidad: e.target.value })} placeholder="ej: kg, mmHg, sem" />
                </div>
              )}

              {formCampo.tipo === 'select' && (
                <div className={styles.field}>
                  <label>Opciones (una por línea) *</label>
                  <textarea
                    rows={5}
                    value={formCampo.opciones}
                    onChange={e => setFormCampo({ ...formCampo, opciones: e.target.value })}
                    placeholder={"Opción 1\nOpción 2\nOpción 3"}
                    className={styles.textarea}
                  />
                </div>
              )}

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={formCampo.requerido}
                  onChange={e => setFormCampo({ ...formCampo, requerido: e.target.checked })}
                />
                Campo requerido
              </label>

              <div className={styles.modalFooter}>
                <button className={styles.btnCancel} onClick={() => setModalCampo(false)}>Cancelar</button>
                <button className={styles.btnSave} onClick={saveCampo} disabled={!formCampo.etiqueta || saving}>
                  {saving ? 'Guardando...' : 'Guardar campo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
