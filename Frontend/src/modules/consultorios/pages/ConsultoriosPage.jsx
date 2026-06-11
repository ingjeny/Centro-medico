import { useState, useEffect } from 'react';
import { getConsultorios, createConsultorio, updateConsultorio } from '../services/consultorios.service';
import styles from './ConsultoriosPage.module.css';

const EMPTY = { nombre: '', nit: '', direccion: '', telefono: '', ciudad: '', email: '' };

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

export default function ConsultoriosPage() {
  const [consultorios, setConsultorios] = useState([]);
  const [modal, setModal] = useState(null);   // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => getConsultorios().then(setConsultorios);
  useEffect(() => { load(); }, []);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); };
  const openEdit = c => {
    setSelected(c);
    setForm({ nombre: c.nombre, nit: c.nit||'', direccion: c.direccion||'', telefono: c.telefono||'', ciudad: c.ciudad||'', email: c.email||'' });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') await createConsultorio(form);
      else await updateConsultorio(selected.id, form);
      setModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const toggleActivo = async (c) => {
    if (!confirm(`¿${c.activo ? 'Desactivar' : 'Reactivar'} el consultorio "${c.nombre}"?`)) return;
    await updateConsultorio(c.id, { ...c, activo: c.activo ? 0 : 1 });
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Consultorios</h1>
          <p className={styles.sub}>Gestiona las sedes o consultorios del sistema</p>
        </div>
        <button className={styles.btnNew} onClick={openCreate}>+ Nuevo consultorio</button>
      </div>

      <div className={styles.grid}>
        {consultorios.map(c => (
          <div key={c.id} className={`${styles.card} ${!c.activo ? styles.inactive : ''}`}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon}>
                <BuildingIcon />
              </div>
              <div className={styles.cardActions}>
                <button className={styles.btnEdit} onClick={() => openEdit(c)}>Editar</button>
                <button
                  className={c.activo ? styles.btnDeact : styles.btnAct}
                  onClick={() => toggleActivo(c)}
                >{c.activo ? 'Desactivar' : 'Reactivar'}</button>
              </div>
            </div>

            <h2 className={styles.cardName}>{c.nombre}</h2>
            {!c.activo && <span className={styles.inactiveBadge}>Inactivo</span>}

            <div className={styles.cardMeta}>
              {c.nit       && <span><strong>NIT:</strong> {c.nit}</span>}
              {c.ciudad    && <span><strong>Ciudad:</strong> {c.ciudad}</span>}
              {c.direccion && <span><strong>Dirección:</strong> {c.direccion}</span>}
              {c.telefono  && <span><strong>Tel:</strong> {c.telefono}</span>}
              {c.email     && <span><strong>Email:</strong> {c.email}</span>}
            </div>

            <div className={styles.cardStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>{c.usuarios_count || 0}</span>
                <span className={styles.statLabel}>usuarios</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>{c.pacientes_count || 0}</span>
                <span className={styles.statLabel}>pacientes</span>
              </div>
            </div>
          </div>
        ))}

        {consultorios.length === 0 && (
          <div className={styles.empty}>
            <BuildingIcon />
            <p>No hay consultorios registrados aún</p>
            <button className={styles.btnNew} onClick={openCreate}>Crear el primero</button>
          </div>
        )}
      </div>

      {modal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2>{modal === 'create' ? 'Nuevo consultorio' : 'Editar consultorio'}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><CloseIcon /></button>
            </div>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre del consultorio *</label>
                <input name="nombre" value={form.nombre} onChange={set} required placeholder="ej: Consultorio Central" />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>NIT / RUT</label>
                  <input name="nit" value={form.nit} onChange={set} placeholder="900000000-1" />
                </div>
                <div className={styles.field}>
                  <label>Ciudad</label>
                  <input name="ciudad" value={form.ciudad} onChange={set} placeholder="Bogotá" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Dirección</label>
                <input name="direccion" value={form.direccion} onChange={set} placeholder="Calle 10 # 5-20" />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={set} placeholder="601 234 5678" />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={set} placeholder="info@consultorio.com" />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className={styles.btnSave} disabled={saving || !form.nombre}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
