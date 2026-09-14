import api from '../../../api/axios';

export const getHistoriasByPaciente = (paciente_id) =>
  api.get(`/historias/paciente/${paciente_id}`).then(r => r.data);

export const getHistoria = (id) => api.get(`/historias/${id}`).then(r => r.data);
export const createHistoria = (data) => api.post('/historias', data).then(r => r.data);
export const updateHistoria = (id, data) => api.put(`/historias/${id}`, data).then(r => r.data);

// Incapacidades
export const getIncapacidadesByPaciente = (paciente_id) =>
  api.get(`/incapacidades/paciente/${paciente_id}`).then(r => r.data);

export const createIncapacidad = (data) => api.post('/incapacidades', data).then(r => r.data);
export const deleteIncapacidad = (id) => api.delete(`/incapacidades/${id}`).then(r => r.data);

// Adjuntos clínicos
export const getAdjuntos = (historia_id) =>
  api.get(`/historias/${historia_id}/adjuntos`).then(r => r.data);

export const subirAdjunto = (historia_id, formData) =>
  api.post(`/historias/${historia_id}/adjuntos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

export const eliminarAdjunto = (adjunto_id) =>
  api.delete(`/historias/adjuntos/${adjunto_id}`).then(r => r.data);
