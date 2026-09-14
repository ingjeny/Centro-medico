import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getResumenCaja, registrarCobro } from '../../citas/services/citas.service';
import { API_URL } from '../../../api/axios';
import useAuthStore from '../../../store/authStore';
import styles from './CajaPage.module.css';

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PAGO_BADGE_STYLE = {
  pagada: { label: 'Pagada', bg: '#d1fae5', color: '#065f46' },
  pendiente_pago: { label: 'Sin pagar', bg: '#fef3c7', color: '#92400e' },
  familiar: { label: 'Familiar', bg: '#ede9fe', color: '#5b21b6' },
  cortesia: { label: 'Cortesía', bg: '#f1f5f9', color: '#475569' },
};

const METODO_BADGE_CLASS = {
  efectivo: styles.badgeEfectivo,
  transferencia: styles.badgeTransferencia,
  tarjeta: styles.badgeTarjeta,
  otro: styles.badgeOtro,
};

export default function CajaPage() {
  const { user } = useAuthStore();
  const canEdit = ['admin', 'secretaria'].includes(user?.rol);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [fecha, setFecha] = useState(todayStr);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal para cobro
  const [cobroModal, setCobroModal] = useState(false);
  const [cobroCita, setCobroCita] = useState(null);
  const [cobroForm, setCobroForm] = useState({
    costo: '',
    metodo_pago: 'efectivo',
    tipo_pago: 'pagada',
    notas_pago: '',
  });
  const [savingCobro, setSavingCobro] = useState(false);

  const loadData = async (targetFecha) => {
    setLoading(true);
    try {
      const data = await getResumenCaja(targetFecha);
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar caja:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(fecha);
  }, [fecha]);

  const handleDateChange = (newDate) => {
    setFecha(newDate);
  };

  const openCobro = (cita) => {
    setCobroCita(cita);
    setCobroForm({
      costo: cita.costo !== null && cita.costo !== undefined && Number(cita.costo) > 0 ? cita.costo : '50000',
      metodo_pago: cita.metodo_pago || 'efectivo',
      tipo_pago: cita.tipo_pago === 'pendiente_pago' ? 'pagada' : (cita.tipo_pago || 'pagada'),
      notas_pago: cita.notas_pago || '',
    });
    setCobroModal(true);
  };

  const handleSaveCobro = async (e) => {
    e.preventDefault();
    if (!cobroCita) return;
    setSavingCobro(true);
    try {
      await registrarCobro(cobroCita.id, {
        costo: Number(cobroForm.costo) || 0,
        metodo_pago: cobroForm.metodo_pago,
        tipo_pago: cobroForm.tipo_pago,
        notas_pago: cobroForm.notas_pago,
      });
      setCobroModal(false);
      loadData(fecha);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar cobro');
    } finally {
      setSavingCobro(false);
    }
  };

  const openRecibo = (citaId) => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/citas/${citaId}/recibo-pdf?token=${token}`, '_blank');
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const ayerStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Módulo de Caja y Recaudos</h1>
          <p className={styles.subtitle}>
            Control de cobros por consulta, arqueo diario y comprobantes de pago
          </p>
        </div>

        <div className={styles.dateFilterWrap}>
          <button
            className={`${styles.dateBtn} ${fecha === todayStr ? styles.dateBtnActive : ''}`}
            onClick={() => handleDateChange(todayStr)}
          >
            Hoy
          </button>
          <button
            className={`${styles.dateBtn} ${fecha === ayerStr ? styles.dateBtnActive : ''}`}
            onClick={() => handleDateChange(ayerStr)}
          >
            Ayer
          </button>
          <input
            type="date"
            className={styles.dateInput}
            value={fecha}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tarjetas KPI ─────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiCardHero}`}>
          <span className={styles.kpiLabel}>Total Recaudado</span>
          <span className={styles.kpiValue}>
            {resumen ? formatCOP(resumen.totalRecaudado) : '$0'}
          </span>
          <span className={styles.kpiSub}>
            {resumen?.citasCount?.pagadas || 0} de {resumen?.citasCount?.total || 0} citas pagadas
          </span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>💵 Efectivo</span>
          <span className={styles.kpiValue}>
            {resumen ? formatCOP(resumen.desgloseMetodos?.efectivo) : '$0'}
          </span>
          <span className={styles.kpiSub}>Caja física / Dinero en mano</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>📱 Transferencias</span>
          <span className={styles.kpiValue}>
            {resumen ? formatCOP(resumen.desgloseMetodos?.transferencia) : '$0'}
          </span>
          <span className={styles.kpiSub}>Nequi, Daviplata, Bancolombia</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>💳 Tarjetas y Otros</span>
          <span className={styles.kpiValue}>
            {resumen ? formatCOP((resumen.desgloseMetodos?.tarjeta || 0) + (resumen.desgloseMetodos?.otro || 0)) : '$0'}
          </span>
          <span className={styles.kpiSub}>Datáfono y consignaciones</span>
        </div>
      </div>

      {/* ── Tabla de Movimientos y Citas del Día ──────────────────────────── */}
      <div className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>
            Movimientos del día: {format(new Date(`${fecha}T12:00:00`), "d 'de' MMMM, yyyy", { locale: es })}
          </span>
          <span className={styles.tableCount}>
            {resumen?.movimientos?.length || 0} cita(s) registradas
          </span>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.emptyState}>Cargando movimientos de caja...</div>
          ) : !resumen?.movimientos || resumen.movimientos.length === 0 ? (
            <div className={styles.emptyState}>
              No hay citas programadas ni cobros para esta fecha.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Especialista</th>
                  <th>Estado Cita</th>
                  <th>Valor</th>
                  <th>Método</th>
                  <th>Estado Pago</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {resumen.movimientos.map((m) => {
                  const badgePago = PAGO_BADGE_STYLE[m.tipo_pago] || PAGO_BADGE_STYLE.pendiente_pago;
                  const badgeMetodoClass = METODO_BADGE_CLASS[m.metodo_pago] || styles.badgeOtro;
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.hora?.slice(0, 5)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.paciente_nombre}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>C.I. {m.paciente_cedula}</div>
                      </td>
                      <td>
                        <div>{m.doctor_nombre}</div>
                        {m.especialidad_nombre && (
                          <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{m.especialidad_nombre}</div>
                        )}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: '12px' }}>
                          {m.estado}
                        </span>
                      </td>
                      <td className={styles.costoText}>
                        {m.costo ? formatCOP(m.costo) : '—'}
                      </td>
                      <td>
                        {m.metodo_pago ? (
                          <span className={`${styles.badge} ${badgeMetodoClass}`}>
                            {m.metodo_pago}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{ background: badgePago.bg, color: badgePago.color }}
                        >
                          {badgePago.label}
                        </span>
                      </td>
                      <td>
                        <div className={styles.btnActions} style={{ justifyContent: 'flex-end' }}>
                          {canEdit && (
                            <button
                              type="button"
                              className={styles.btnCobrarSmall}
                              onClick={() => openCobro(m)}
                              title="Registrar o modificar cobro"
                            >
                              💵 {Number(m.costo) > 0 ? 'Editar' : 'Cobrar'}
                            </button>
                          )}
                          {(Number(m.costo) > 0 || m.tipo_pago === 'pagada') && (
                            <button
                              type="button"
                              className={styles.btnReciboSmall}
                              onClick={() => openRecibo(m.id)}
                              title="Imprimir Comprobante / Recibo de Pago"
                            >
                              🧾 Recibo
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal Cobro de Cita ──────────────────────────────────────────────── */}
      {cobroModal && cobroCita && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>💵 Cobro de Cita</h2>
              <button className={styles.closeBtn} onClick={() => setCobroModal(false)}><CloseIcon /></button>
            </div>

            <div style={{ marginBottom: '16px', background: 'var(--surface-2)', padding: '12px 14px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.5' }}>
              <p><strong>Paciente:</strong> {cobroCita.paciente_nombre}</p>
              <p><strong>Fecha/Hora:</strong> {cobroCita.fecha?.slice(0, 10)} · {cobroCita.hora?.slice(0, 5)}</p>
              <p><strong>Doctor:</strong> {cobroCita.doctor_nombre}</p>
            </div>

            <form onSubmit={handleSaveCobro} className={styles.form}>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Valor de Consulta ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={cobroForm.costo}
                    onChange={(e) => setCobroForm({ ...cobroForm, costo: e.target.value })}
                    placeholder="Ej: 50000"
                  />
                </div>
                <div className={styles.field}>
                  <label>Método de Pago *</label>
                  <select
                    value={cobroForm.metodo_pago}
                    onChange={(e) => setCobroForm({ ...cobroForm, metodo_pago: e.target.value })}
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia (Nequi/Daviplata/Banco)</option>
                    <option value="tarjeta">Tarjeta Débito / Crédito</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Estado del Pago *</label>
                <select
                  value={cobroForm.tipo_pago}
                  onChange={(e) => setCobroForm({ ...cobroForm, tipo_pago: e.target.value })}
                  required
                >
                  <option value="pagada">Pagada (Cobro completado)</option>
                  <option value="pendiente_pago">Sin pagar (Pendiente)</option>
                  <option value="familiar">Familiar (Exonerado)</option>
                  <option value="cortesia">Cortesía (Exonerado)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Notas de Cobro / Transacción (opcional)</label>
                <input
                  type="text"
                  value={cobroForm.notas_pago}
                  onChange={(e) => setCobroForm({ ...cobroForm, notas_pago: e.target.value })}
                  placeholder="Ej: N° Transacción 9012, pagó $50.000"
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setCobroModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSave} disabled={savingCobro}>
                  {savingCobro ? 'Guardando...' : 'Registrar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
