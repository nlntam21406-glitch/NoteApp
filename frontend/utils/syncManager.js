// src/utils/syncManager.js
import { getAllQueued, clearQueued, saveNotes } from '../db/noteDB';
import api from '../api/axios';
let syncing = false;

export async function syncToServer() {
    if (syncing || !navigator.onLine) return;
    syncing = true;
    try {
        const q = await getAllQueued();
        const done = [];
        for (const item of q) {
            try {
                if (item.type==='update') await api.put(`/notes/${item.noteId}`, item.data);
                else if (item.type==='delete') await api.delete(`/notes/${item.noteId}`);
                done.push(item.id);
            } catch(e) { if (e.response?.status===404) done.push(item.id); }
        }
        if (done.length) await clearQueued(done);
        const { data } = await api.get('/notes');
        await saveNotes(data.notes);
        window.dispatchEvent(new CustomEvent('notes-synced', { detail: data.notes }));
    } finally { syncing = false; }
}

export function registerSyncListeners() {
    window.addEventListener('online', () => syncToServer());
    setInterval(() => { if (navigator.onLine) syncToServer(); }, 300000);
}
