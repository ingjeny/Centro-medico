import api from '../../../api/axios';

export const getUsuarios = () => api.get('/usuarios').then(r => r.data);
export const createUsuario = (data) => api.post('/usuarios', data).then(r => r.data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then(r => r.data);
export const updatePassword = (id, password) => api.put(`/usuarios/${id}/password`, { password }).then(r => r.data);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`).then(r => r.data);
