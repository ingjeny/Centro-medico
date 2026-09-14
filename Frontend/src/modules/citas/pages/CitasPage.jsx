import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCitasByMonth, getCitasByDate, createCita, updateEstado, updateTipoPago, deleteCita, registrarCobro } from '../services/citas.service';
import { getPacientes } from '../../pacientes/services/pacientes.service';
import useAuthStore from '../../../store/authStore';
import api, { API_URL } from '../../../api/axios';
import { buildWhatsAppReminderUrl } from '../../../helpers/whatsapp';
import styles from './CitasPage.module.css';

const ESTADO_COLOR = {
  pendiente:  '#f59e0b',
  confirmada: '#6366f1',
  completada: '#10b981',
  cancelada:  '#ef4444',
};

const PAGO_CONFIG = {
  pagada:        { label: 'Pagada',       color: '#10b981', bg: '#d1fae5', icon: '✓' },
  pendiente_pago:{ label: 'Sin pagar',    color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  familiar:      { label: 'Familiar',     color: '#6366f1', bg: '#ede9fe', icon: '♥' },
  cortesia:      { label: 'Cortesía',     color: '#64748b', bg: '#f1f5f9', icon: '★' },
};

const HORAS = ['07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

const EMPTY_FORM = { paciente_id: '', doctor_id: '', fecha: '', hora: '', motivo: '', notas: '', tipo_pago: 'pendiente_pago' };

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CitasPage() {
  const { user } = useAuthStore();
  const canEdit = ['admin', 'secretaria'].includes(user?.rol);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [citasMes, setCitasMes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [citasDia, setCitasDia] = useState([]);
  const [modal, setModal] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  // Estado para modal de cobro
  const [cobroModal, setCobroModal] = useState(false);
  const [cobroCita, setCobroCita] = useState(null);
  const [cobroForm, setCobroForm] = useState({
    costo: '',
    metodo_pago: 'efectivo',
    tipo_pago: 'pagada',
    notas_pago: '',
  });
  const [savingCobro, setSavingCobro] = useState(false);

  const loadMes = () =>
    getCitasByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1).then(setCitasMes);

  useEffect(() => { loadMes(); }, [currentDate]);

  useEffect(() => {
    getPacientes().then(setPacientes);
    api.get('/usuarios/doctores').then(r => setDoctores(r.data));
  }, []);

  const handleDayClick = async (date) => {
    setSelectedDate(date);
    setCitasDia(await getCitasByDate(format(date, 'yyyy-MM-dd')));
  };

  const refreshDia = async (fecha) => {
    if (selectedDate && fecha === format(selectedDate, 'yyyy-MM-dd')) {
      setCitasDia(await getCitasByDate(fecha));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCita(form);
      setModal(false);
      setForm(EMPTY_FORM);
      loadMes();
      refreshDia(form.fecha);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear cita');
    } finally { setLoading(false); }
  };

  const handleEstado = async (id, estado) => {
    await updateEstado(id, estado);
    loadMes();
    if (selectedDate) setCitasDia(await getCitasByDate(format(selectedDate, 'yyyy-MM-dd')));
  };

  const handlePago = async (id, tipo_pago) => {
    await updateTipoPago(id, tipo_pago);
    loadMes();
    if (selectedDate) setCitasDia(await getCitasByDate(format(selectedDate, 'yyyy-MM-dd')));
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    await deleteCita(id);
    loadMes();
    if (selectedDate) setCitasDia(await getCitasByDate(format(selectedDate, 'yyyy-MM-dd')));
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
      loadMes();
      if (selectedDate) setCitasDia(await getCitasByDate(format(selectedDate, 'yyyy-MM-dd')));
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

  const sendWhatsApp = (cita) => {
    const url = buildWhatsAppReminderUrl(cita);
    if (!url) {
      alert('El paciente no tiene un número de teléfono válido registrado.');
      return;
    }
    window.open(url, '_blank');
  };

  const openModal = () => {
    setForm({
      ...EMPTY_FORM,
      fecha: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    });
    setModal(true);
  };

  // ── Calendario ────────────────────────────────────────────────────────────
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let day = startDate;

    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = day;
        const dateStr = format(d, 'yyyy-MM-dd');
        const citasDelDia = citasMes.filter(c => c.fecha?.slice(0, 10) === dateStr);
        const isSelected = selectedDate && isSameDay(d, selectedDate);
        const isToday = isSameDay(d, new Date());
        const isCurrentMonth = isSameMonth(d, currentDate);

        week.push(
          <div
            key={d.toString()}
            className={`${styles.day} ${!isCurrentMonth ? styles.outside : ''} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
            onClick={() => handleDayClick(d)}
          >
            <span className={styles.dayNum}>{format(d, 'd')}</span>
            {citasDelDia.slice(0, 2).map(c => {
              const pago = PAGO_CONFIG[c.tipo_pago] || PAGO_CONFIG.pendiente_pago;
              return (
                <div key={c.id} className={styles.citaBadge} style={{ background: ESTADO_COLOR[c.estado] }}>
                  {c.hora?.slice(0, 5)} {c.paciente_nombre?.split(' ')[0]}
                  <span className={styles.badgePago} style={{ background: pago.bg, color: pago.color }}>{pago.icon}</span>
                </div>
              );
            })}
            {citasDelDia.length > 2 && <div className={styles.moreBadge}>+{citasDelDia.length - 2}</div>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div key={day.toString()} className={styles.week}>{week}</div>);
    }
    return rows;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Calendario</h1>
          <p className={styles.subtitle}>{format(currentDate, "MMMM yyyy", { locale: es })}</p>
        </div>
        {canEdit && (
          <button className={styles.btnNew} onClick={openModal}>+ Nueva cita</button>
        )}
      </div>

      <div className={styles.layout}>
        {/* ── Calendario ─────────────────────────────────────────────────── */}
        <div className={styles.calCard}>
          <div className={styles.calNav}>
            <button className={styles.calNavBtn} onClick={() => setCurrentDate(subMonths(currentDate, 1))}>‹</button>
            <span className={styles.calNavTitle}>{format(currentDate, "MMMM yyyy", { locale: es })}</span>
            <button className={styles.calNavBtn} onClick={() => setCurrentDate(addMonths(currentDate, 1))}>›</button>
          </div>

          <div className={styles.weekDays}>
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} className={styles.weekDay}>{d}</div>
            ))}
          </div>

          <div className={styles.calBody}>{renderCalendar()}</div>

          <div className={styles.legend}>
            <span className={styles.legendGroup}>Estado:</span>
            {Object.entries(ESTADO_COLOR).map(([k, v]) => (
              <div key={k} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: v }} />
                <span style={{ textTransform: 'capitalize' }}>{k}</span>
              </div>
            ))}
            <span className={styles.legendSep} />
            <span className={styles.legendGroup}>Pago:</span>
            {Object.entries(PAGO_CONFIG).map(([k, v]) => (
              <div key={k} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: v.color }} />
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel lateral del día ────────────────────────────────────────── */}
        <div className={styles.sidePanel}>
          {selectedDate ? (
            <>
              <div className={styles.sidePanelHead}>
                <p className={styles.sidePanelTitle}>
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <div className={styles.horasList}>
                {HORAS.map(hora => {
                  const cita = citasDia.find(c => c.hora?.slice(0, 5) === hora);
                  const pago = cita ? (PAGO_CONFIG[cita.tipo_pago] || PAGO_CONFIG.pendiente_pago) : null;
                  return (
                    <div key={hora} className={styles.horaRow}>
                      <span className={styles.horaLabel}>{hora}</span>
                      <div className={styles.horaSlot}>
                        {cita ? (
                          <div className={styles.citaItem} style={{ borderLeftColor: ESTADO_COLOR[cita.estado] }}>
                            <div className={styles.citaItemTop}>
                              <p className={styles.citaItemName}>{cita.paciente_nombre}</p>
                              {/* Badge de pago */}
                              <span
                                className={styles.pagoBadge}
                                style={{ background: pago.bg, color: pago.color }}
                              >
                                {pago.icon} {pago.label}
                              </span>
                            </div>
                            <p className={styles.citaItemSub}>
                              {cita.doctor_nombre}{cita.motivo ? ` · ${cita.motivo}` : ''}
                            </p>
                            <div className={styles.citaItemFooter}>
                              {/* Estado */}
                              <select
                                className={styles.estadoSelect}
                                value={cita.estado}
                                onChange={e => handleEstado(cita.id, e.target.value)}
                                style={{ color: ESTADO_COLOR[cita.estado] }}
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                              </select>

                              {/* WhatsApp recordatorio */}
                              <button
                                type="button"
                                className={styles.btnWhatsApp}
                                title="Enviar recordatorio por WhatsApp"
                                onClick={() => sendWhatsApp(cita)}
                              >
                                💬
                              </button>

                              {/* Cobrar y Recibo */}
                              {canEdit && (
                                <>
                                  <button
                                    type="button"
                                    className={styles.btnCobrar}
                                    onClick={() => openCobro(cita)}
                                    title="Registrar o editar cobro de la cita"
                                  >
                                    💵 {cita.costo ? `$${Number(cita.costo).toLocaleString('es-CO')}` : 'Cobrar'}
                                  </button>
                                  {(Number(cita.costo) > 0 || cita.tipo_pago === 'pagada') && (
                                    <button
                                      type="button"
                                      className={styles.btnRecibo}
                                      onClick={() => openRecibo(cita.id)}
                                      title="Descargar comprobante de pago en PDF"
                                    >
                                      🧾 Recibo
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Tipo de pago */}
                              {canEdit && (
                                <select
                                  className={styles.pagoSelect}
                                  value={cita.tipo_pago || 'pendiente_pago'}
                                  onChange={e => handlePago(cita.id, e.target.value)}
                                  style={{ color: pago.color }}
                                >
                                  <option value="pendiente_pago">Sin pagar</option>
                                  <option value="pagada">Pagada</option>
                                  <option value="familiar">Familiar</option>
                                  <option value="cortesia">Cortesía</option>
                                </select>
                              )}
                              {canEdit && (
                                <button className={styles.btnDelCita} onClick={() => handleDelete(cita.id)} title="Eliminar cita">
                                  <CloseIcon />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.sideEmpty}>
              <p>Selecciona un día para ver las citas programadas</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal nueva cita ─────────────────────────────────────────────────── */}
      {modal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <h2 className={styles.modalTitle}>Nueva cita</h2>
              <button className={styles.closeBtn} onClick={() => setModal(false)}><CloseIcon /></button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label>Paciente *</label>
                <select value={form.paciente_id} onChange={e => setForm({ ...form, paciente_id: e.target.value })} required>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label>Doctor *</label>
                <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} required>
                  <option value="">Seleccionar doctor</option>
                  {doctores.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>

              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label>Fecha *</label>
                  <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
                </div>
                <div className={styles.field}>
                  <label>Hora *</label>
                  <select value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} required>
                    <option value="">Seleccionar</option>
                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Motivo de consulta</label>
                <input value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Motivo de la consulta" />
              </div>

              {/* ── Tipo de pago ── */}
              <div className={styles.field}>
                <label>Tipo de pago *</label>
                <div className={styles.pagoGrid}>
                  {Object.entries(PAGO_CONFIG).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      className={`${styles.pagoOption} ${form.tipo_pago === k ? styles.pagoSelected : ''}`}
                      style={form.tipo_pago === k ? { borderColor: v.color, background: v.bg, color: v.color } : {}}
                      onClick={() => setForm({ ...form, tipo_pago: k })}
                    >
                      <span className={styles.pagoIcon}>{v.icon}</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnSave} disabled={loading}>
                  {loading ? 'Guardando...' : 'Crear cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    onChange={e => setCobroForm({ ...cobroForm, costo: e.target.value })}
                    placeholder="Ej: 50000"
                  />
                </div>
                <div className={styles.field}>
                  <label>Método de Pago *</label>
                  <select
                    value={cobroForm.metodo_pago}
                    onChange={e => setCobroForm({ ...cobroForm, metodo_pago: e.target.value })}
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
                  onChange={e => setCobroForm({ ...cobroForm, tipo_pago: e.target.value })}
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
                  onChange={e => setCobroForm({ ...cobroForm, notas_pago: e.target.value })}
                  placeholder="Ej: Aprobación #5541, recibidos $100.000, vuelto $50.000"
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
