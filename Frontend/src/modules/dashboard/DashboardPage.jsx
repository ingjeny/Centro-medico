import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCitasByDate } from '../citas/services/citas.service';
import { getPacientes } from '../pacientes/services/pacientes.service';
import useAuthStore from '../../store/authStore';
import styles from './DashboardPage.module.css';

const ESTADO_STYLE = {
  pendiente:  { background: '#fffbeb', color: '#d97706' },
  confirmada: { background: '#eff6ff', color: '#2563eb' },
  completada: { background: '#f0fdf4', color: '#16a34a' },
  cancelada:  { background: '#fef2f2', color: '#dc2626' },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const hoy = format(new Date(), 'yyyy-MM-dd');

  const [citasHoy, setCitasHoy] = useState([]);
  const [totalPacientes, setTotalPacientes] = useState(0);

  useEffect(() => {
    getCitasByDate(hoy).then(setCitasHoy);
    getPacientes().then(d => setTotalPacientes(d.length));
  }, []);

  const ROL_LABEL = { admin: 'Administrador', doctor: 'Doctor', secretaria: 'Secretaria' };

  const quickActions = [
    { label: 'Registrar paciente',      roles: ['admin','secretaria'], path: '/pacientes' },
    { label: 'Programar cita',          roles: ['admin','secretaria'], path: '/citas' },
    { label: 'Nueva historia clínica',  roles: ['admin','doctor'],     path: '/historias' },
    { label: 'Buscar historial',        roles: ['admin','doctor','secretaria'], path: '/historias' },
  ].filter(a => a.roles.includes(user?.rol));

  return (
    <div className={styles.page}>
      <div className={styles.welcome}>
        <h1 className={styles.greeting}>Bienvenido, {user?.nombre}</h1>
        <p className={styles.date}>{format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</p>
        <span className={styles.rolPill}>{ROL_LABEL[user?.rol]}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard} onClick={() => navigate('/citas')}>
          <p className={styles.statLabel}>Citas hoy</p>
          <p className={styles.statNum}>{citasHoy.length}</p>
        </div>
        <div className={styles.statCard} onClick={() => navigate('/pacientes')}>
          <p className={styles.statLabel}>Pacientes</p>
          <p className={styles.statNum}>{totalPacientes}</p>
        </div>
        <div className={styles.statCard} onClick={() => navigate('/citas')}>
          <p className={styles.statLabel}>Pendientes</p>
          <p className={styles.statNum}>{citasHoy.filter(c => c.estado === 'pendiente').length}</p>
        </div>
        <div className={styles.statCard} onClick={() => navigate('/citas')}>
          <p className={styles.statLabel}>Completadas</p>
          <p className={styles.statNum}>{citasHoy.filter(c => c.estado === 'completada').length}</p>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Citas de hoy</span>
            <button className={styles.linkBtn} onClick={() => navigate('/citas')}>Ver calendario</button>
          </div>
          {citasHoy.length === 0 ? (
            <p className={styles.empty}>Sin citas programadas para hoy</p>
          ) : (
            <div className={styles.citasList}>
              {citasHoy.map(c => (
                <div key={c.id} className={styles.citaRow}>
                  <span className={styles.hora}>{c.hora?.slice(0,5)}</span>
                  <div className={styles.citaData}>
                    <p className={styles.pacNombre}>{c.paciente_nombre}</p>
                    <p className={styles.drNombre}>{c.doctor_nombre}</p>
                  </div>
                  <span className={styles.estadoBadge} style={ESTADO_STYLE[c.estado]}>
                    {c.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.actionsCard}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Accesos rápidos</span>
          </div>
          <div className={styles.actionsList}>
            {quickActions.map(a => (
              <button key={a.label} className={styles.actionItem} onClick={() => navigate(a.path)}>
                <span className={styles.actionDot} />
                {a.label}
                <span className={styles.actionArrow}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
