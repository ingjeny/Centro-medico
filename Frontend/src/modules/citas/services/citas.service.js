import api from '../../../api/axios';

export const getCitasByMonth = (year, month) =>
  api.get('/citas', { params: { year, month } }).then(r => r.data);

export const getCitasByDate = (fecha) =>
  api.get(`/citas/fecha/${fecha}`).then(r => r.data);

export const createCita = (data) => api.post('/citas', data).then(r => r.data);
export const updateCita = (id, data) => api.put(`/citas/${id}`, data).then(r => r.data);
export const updateEstado = (id, estado) => api.patch(`/citas/${id}/estado`, { estado }).then(r => r.data);
export const updateTipoPago = (id, tipo_pago) => api.patch(`/citas/${id}/pago`, { tipo_pago }).then(r => r.data);
export const deleteCita = (id) => api.delete(`/citas/${id}`).then(r => r.data);
