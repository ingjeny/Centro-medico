import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaciente } from '../services/pacientes.service';
import { getHistoriasByPaciente } from '../../historias/services/historias.service';
import useAuthStore from '../../../store/authStore';
import styles from './PacienteDetallePage.module.css';

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

export default function PacienteDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [paciente, setPaciente] = useState(null);
  const [historias, setHistorias] = useState([]);

  useEffect(() => {
    getPaciente(id).then(setPaciente);
    getHistoriasByPaciente(id).then(setHistorias);
  }, [id]);

  if (!paciente) return null;

  const calcEdad = (fn) => {
    if (!fn) return '—';
    const d = new Date(); const n = new Date(fn);
    let e = d.getFullYear() - n.getFullYear();
    if (d < new Date(d.getFullYear(), n.getMonth(), n.getDate())) e--;
    return e + ' años';
  };

  const sexoLabel = { M: 'Masculino', F: 'Femenino', Otro: 'Otro' };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate('/pacientes')}>← Volver</button>
        {['admin', 'doctor'].includes(user?.rol) && (
          <button className={styles.btnHistoria} onClick={() => navigate(`/historias/nueva?paciente_id=${id}`)}>
            + Nueva historia clínica
          </button>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.avatar}>{paciente.nombre[0]}{paciente.apellido[0]}</div>
          <div>
            <p className={styles.patientName}>{paciente.nombre} {paciente.apellido}</p>
            <p className={styles.patientCedula}>C.I. {paciente.cedula}</p>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Edad</p>
            <p className={styles.infoValue}>{calcEdad(paciente.fecha_nacimiento)}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Sexo</p>
            <p className={styles.infoValue}>{sexoLabel[paciente.sexo] || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Tipo de sangre</p>
            <p className={styles.infoValue}>{paciente.tipo_sangre || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Teléfono</p>
            <p className={styles.infoValue}>{paciente.telefono || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Correo</p>
            <p className={styles.infoValue}>{paciente.email || '—'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Dirección</p>
            <p className={styles.infoValue}>{paciente.direccion || '—'}</p>
          </div>
        </div>

        {paciente.alergias && (
          <div className={styles.alertBox}>
            <span className={styles.alertLabel}>Alergias:</span>{paciente.alergias}
          </div>
        )}
        {paciente.antecedentes && (
          <div className={styles.notesBox}>
            <span className={styles.notesLabel}>Antecedentes médicos</span>
            {paciente.antecedentes}
          </div>
        )}
      </div>

      <div className={styles.historiasSec}>
        <div className={styles.secHead}>
          <span className={styles.secTitle}>Historial clínico</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{historias.length} consulta(s)</span>
        </div>

        {historias.length === 0 ? (
          <p className={styles.empty}>Sin historias clínicas registradas</p>
        ) : (
          <div className={styles.historiasList}>
            {historias.map(h => (
              <div key={h.id} className={styles.historiaCard} onClick={() => navigate(`/historias/${h.id}`)}>
                <span className={styles.hDate}>{new Date(h.fecha).toLocaleDateString('es-ES')}</span>
                <div>
                  <p className={styles.hDr}>Dr./Dra. {h.doctor_nombre}</p>
                  <p className={styles.hMotivo}>{h.motivo_consulta || 'Sin motivo registrado'}</p>
                </div>
                <span className={styles.hArrow}><ChevronRight /></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
