import api from '../../../api/axios';

export const getEspecialidades    = ()        => api.get('/especialidades').then(r => r.data);
export const createEspecialidad   = (data)    => api.post('/especialidades', data).then(r => r.data);
export const updateEspecialidad   = (id, data)=> api.put(`/especialidades/${id}`, data).then(r => r.data);
export const deleteEspecialidad   = (id)      => api.delete(`/especialidades/${id}`).then(r => r.data);

export const getCampos     = (espId)          => api.get(`/especialidades/${espId}/campos`).then(r => r.data);
export const createCampo   = (espId, data)    => api.post(`/especialidades/${espId}/campos`, data).then(r => r.data);
export const updateCampo   = (espId, id, data)=> api.put(`/especialidades/${espId}/campos/${id}`, data).then(r => r.data);
export const deleteCampo   = (espId, id)      => api.delete(`/especialidades/${espId}/campos/${id}`).then(r => r.data);
export const reorderCampos = (espId, ids)     => api.post(`/especialidades/${espId}/campos/reorder`, { ids }).then(r => r.data);
