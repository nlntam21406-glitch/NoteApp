// src/api/noteApi.js
import api from './axios';
import { unlockTokenStore } from '../utils/unlockTokenStore';

function withUnlock(id, cfg = {}) {
    const t = unlockTokenStore.get(id);
    if (!t) return cfg;
    return { ...cfg, headers: { ...(cfg.headers||{}), 'X-Note-Unlock-Token': t } };
}
export const fetchNotes   = (p = {})  => api.get('/notes', { params: p });
export const createNote   = (d)       => api.post('/notes', d);
export const updateNote   = (id, d)   => api.put(`/notes/${id}`, d, withUnlock(id));
export const deleteNote   = (id)      => api.delete(`/notes/${id}`, withUnlock(id));
export const togglePin    = (id)      => api.post(`/notes/${id}/pin`);
export const uploadImages = (id, files) => {
    const f = new FormData(); files.forEach(x => f.append('images[]', x));
    return api.post(`/notes/${id}/images`, f, { headers: { ...(withUnlock(id).headers||{}), 'Content-Type': 'multipart/form-data' } });
};
export const removeImage  = (id, path) => api.delete(`/notes/${id}/images`, { ...withUnlock(id), data: { path } });
export const verifyLock   = (id, pw)   => api.post(`/notes/${id}/lock/verify`, { password: pw });
export const enableLock   = (id, pw, pwc) => api.post(`/notes/${id}/lock/enable`, { password: pw, password_confirmation: pwc });
export const changeLock   = (id, cur, pw, pwc) => api.put(`/notes/${id}/lock/change`, { current_password: cur, password: pw, password_confirmation: pwc });
export const disableLock  = (id, cur) => api.delete(`/notes/${id}/lock/disable`, { data: { current_password: cur } });
export const fetchLabels  = ()        => api.get('/labels');
export const createLabel  = (name)    => api.post('/labels', { name });
export const updateLabel  = (id, n)   => api.put(`/labels/${id}`, { name: n });
export const deleteLabel  = (id)      => api.delete(`/labels/${id}`);
export const syncLabels   = (nId, ids) => api.post(`/notes/${nId}/labels`, { label_ids: ids });
