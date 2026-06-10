import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes } from '../../pacientes/services/pacientes.service';
import { getHistoriasByPaciente } from '../services/historias.service';
import styles from './HistoriasPage.module.css';

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

export default function HistoriasPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [historias, setHistorias] = useState([]);

  useEffect(() => { getPacientes().then(setPacientes); }, []);

  const filtered = pacientes.filter(p =>
    `${p.nombre} ${p.apellido} ${p.cedula}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (p) => {
    setSelected(p);
    getHistoriasByPaciente(p.id).then(setHistorias);
  };

  const openPDF = (id) => {
    window.open(`http://localhost:3000/api/historias/${id}/pdf?token=${localStorage.getItem('token')}`, '_blank');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Historial clínico</h1>

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <div className={styles.panelHead}>Pacientes</div>
          <div className={styles.searchWrap}>
            <SearchIcon />
            <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className={styles.pacienteList}>
            {filtered.map(p => (
              <div
                key={p.id}
                className={`${styles.pacienteItem} ${selected?.id === p.id ? styles.active : ''}`}
                onClick={() => handleSelect(p)}
              >
                <div className={styles.pAvatar}>{p.nombre[0]}{p.apellido[0]}</div>
                <div>
                  <p className={styles.pName}>{p.apellido}, {p.nombre}</p>
                  <p className={styles.pCedula}>{p.cedula}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className={styles.empty}>Sin resultados</p>}
          </div>
        </div>

        <div className={styles.rightPanel}>
          {selected ? (
            <>
              <div className={styles.rightHead}>
                <div className={styles.rightHeadInfo}>
                  <p className={styles.patientName}>{selected.nombre} {selected.apellido}</p>
                  <p className={styles.patientCedula}>C.I. {selected.cedula} · {historias.length} consulta(s)</p>
                </div>
                <div className={styles.rightHeadBtns}>
                  <button className={styles.btnOutline} onClick={() => navigate(`/pacientes/${selected.id}`)}>Ver paciente</button>
                  <button className={styles.btnPrimary} onClick={() => navigate(`/historias/nueva?paciente_id=${selected.id}`)}>
                    + Nueva historia
                  </button>
                </div>
              </div>

              {historias.length === 0 ? (
                <p className={styles.empty}>Sin historias clínicas</p>
              ) : (
                <div className={styles.historiasList}>
                  {historias.map(h => (
                    <div key={h.id} className={styles.historiaCard}>
                      <span className={styles.hDate}>{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                      <div>
                        <p className={styles.hDr}>Dr./Dra. {h.doctor_nombre}</p>
                        <p className={styles.hMotivo}>{h.motivo_consulta || 'Sin motivo'}</p>
                        {h.diagnostico && <p className={styles.hDiag}>{h.diagnostico}</p>}
                      </div>
                      <div className={styles.hBtns}>
                        <button className={styles.btnView} onClick={() => navigate(`/historias/${h.id}`)}>Ver</button>
                        <button className={styles.btnPDF} onClick={() => openPDF(h.id)}>PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noSelected}>
              <p>Selecciona un paciente de la lista para ver su historial clínico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
