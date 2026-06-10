import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/usuarios.service';
import styles from './UsuariosPage.module.css';

const ROL_LABEL = { admin: 'Administrador', doctor: 'Doctor', secretaria: 'Secretaria' };
const ROL_COLOR = { admin: '#7c3aed', doctor: '#2563eb', secretaria: '#059669' };
const empty = { nombre: '', email: '', password: '', rol: 'secretaria', activo: 1 };

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const load = () => getUsuarios().then(setUsuarios);
  useEffect(() => { load(); }, []);

  const set = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await createUsuario(form); setModal(null); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await updateUsuario(selected.id, form); setModal(null); load(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    await deleteUsuario(id);
    load();
  };

  const openEdit = u => {
    setSelected(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, activo: u.activo });
    setModal('edit');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>{usuarios.length} usuario(s)</p>
        </div>
        <button className={styles.btnNew} onClick={() => { setForm(empty); setModal('create'); }}>+ Nuevo usuario</button>
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar} style={{ background: ROL_COLOR[u.rol] }}>
                      {u.nombre[0].toUpperCase()}
                    </div>
                    <div>
                      <p className={styles.userName}>{u.nombre}</p>
                      <p className={styles.userEmail}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.rolBadge} style={{ background: ROL_COLOR[u.rol] + '18', color: ROL_COLOR[u.rol] }}>
                    {ROL_LABEL[u.rol]}
                  </span>
                </td>
                <td>
                  <span className={`${styles.estadoBadge} ${u.activo ? styles.activo : styles.inactivo}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit} onClick={() => openEdit(u)}>Editar</button>
                    {u.activo ? (
                      <button className={styles.btnDel} onClick={() => handleDelete(u.id)}>Desactivar</button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><CloseIcon /></button>
            </div>
            <form onSubmit={modal === 'create' ? handleCreate : handleEdit} className={styles.form}>
              <div className={styles.field}>
                <label>Nombre completo *</label>
                <input name="nombre" value={form.nombre} onChange={set} required />
              </div>
              <div className={styles.field}>
                <label>Correo electrónico *</label>
                <input type="email" name="email" value={form.email} onChange={set} required />
              </div>
              <div className={styles.field}>
                <label>{modal === 'create' ? 'Contraseña *' : 'Nueva contraseña (dejar vacío para no cambiar)'}</label>
                <input type="password" name="password" value={form.password} onChange={set} required={modal === 'create'} />
              </div>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Rol *</label>
                  <select name="rol" value={form.rol} onChange={set}>
                    <option value="secretaria">Secretaria</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                {modal === 'edit' && (
                  <div className={styles.field}>
                    <label>Estado</label>
                    <select name="activo" value={form.activo} onChange={set}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className={styles.btnSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
