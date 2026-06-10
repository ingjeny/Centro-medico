import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../services/pacientes.service';
import PacienteForm from '../components/PacienteForm';
import useAuthStore from '../../../store/authStore';
import styles from './PacientesPage.module.css';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function PacientesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canEdit = ['admin', 'secretaria'].includes(user?.rol);

  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = (q = '') => getPacientes(q).then(setPacientes);

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => { setSearch(e.target.value); load(e.target.value); };

  const handleCreate = async (form) => {
    setLoading(true);
    try { await createPaciente(form); setModal(null); load(search); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleEdit = async (form) => {
    setLoading(true);
    try { await updatePaciente(selected.id, form); setModal(null); load(search); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este paciente?')) return;
    await deletePaciente(id);
    load(search);
  };

  const calcEdad = (fn) => {
    if (!fn) return '—';
    const d = new Date(); const n = new Date(fn);
    let e = d.getFullYear() - n.getFullYear();
    if (d < new Date(d.getFullYear(), n.getMonth(), n.getDate())) e--;
    return e + ' a';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pacientes</h1>
          <p className={styles.subtitle}>{pacientes.length} registrado(s)</p>
        </div>
        {canEdit && (
          <button className={styles.btnNew} onClick={() => setModal('create')}>
            + Nuevo paciente
          </button>
        )}
      </div>

      <div className={styles.searchWrap}>
        <SearchIcon />
        <input placeholder="Buscar por nombre o cédula..." value={search} onChange={handleSearch} />
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Edad</th>
              <th>Teléfono</th>
              <th>Sangre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map(p => (
              <tr key={p.id}>
                <td><span className={styles.name}>{p.apellido}, {p.nombre}</span></td>
                <td><span className={styles.cedula}>{p.cedula}</span></td>
                <td>{calcEdad(p.fecha_nacimiento)}</td>
                <td>{p.telefono || '—'}</td>
                <td>{p.tipo_sangre || '—'}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnView} onClick={() => navigate(`/pacientes/${p.id}`)}>Ver</button>
                    {canEdit && (
                      <button className={styles.btnEdit} onClick={() => { setSelected(p); setModal('edit'); }}>Editar</button>
                    )}
                    {user?.rol === 'admin' && (
                      <button className={styles.btnDel} onClick={() => handleDelete(p.id)}>Eliminar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {pacientes.length === 0 && (
              <tr><td colSpan={6}><p className={styles.empty}>Sin pacientes registrados</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>{modal === 'create' ? 'Nuevo paciente' : 'Editar paciente'}</h2>
              <button className={styles.closeBtn} onClick={() => setModal(null)}><CloseIcon /></button>
            </div>
            <PacienteForm
              initial={modal === 'edit' ? selected : {}}
              onSubmit={modal === 'create' ? handleCreate : handleEdit}
              onCancel={() => setModal(null)}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
