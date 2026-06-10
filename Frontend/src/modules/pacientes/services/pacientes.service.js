import api from '../../../api/axios';

export const getPacientes = (q) => api.get('/pacientes', { params: q ? { q } : {} }).then(r => r.data);
export const getPaciente = (id) => api.get(`/pacientes/${id}`).then(r => r.data);
export const createPaciente = (data) => api.post('/pacientes', data).then(r => r.data);
export const updatePaciente = (id, data) => api.put(`/pacientes/${id}`, data).then(r => r.data);
export const deletePaciente = (id) => api.delete(`/pacientes/${id}`).then(r => r.data);
