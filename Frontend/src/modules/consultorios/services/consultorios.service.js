import api from '../../../api/axios';

export const getConsultorios    = ()        => api.get('/consultorios').then(r => r.data);
export const createConsultorio  = (data)    => api.post('/consultorios', data).then(r => r.data);
export const updateConsultorio  = (id, data)=> api.put(`/consultorios/${id}`, data).then(r => r.data);
export const deleteConsultorio  = (id)      => api.delete(`/consultorios/${id}`).then(r => r.data);
