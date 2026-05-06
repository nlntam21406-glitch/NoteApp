// src/api/shareApi.js
import api from './axios';
export const getShares        = (nId)              => api.get(`/notes/${nId}/shares`);
export const shareNote        = (nId, email, perm) => api.post(`/notes/${nId}/shares`, { email, permission: perm });
export const updateShare      = (nId, sId, perm)   => api.put(`/notes/${nId}/shares/${sId}`, { permission: perm });
export const revokeShare      = (nId, sId)         => api.delete(`/notes/${nId}/shares/${sId}`);
export const getSharedWithMe  = ()                 => api.get('/shared-with-me');
export const getSharedNote    = (id)               => api.get(`/shared-notes/${id}`);
export const updateSharedNote = (id, d)            => api.put(`/shared-notes/${id}`, d);
