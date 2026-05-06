// src/db/noteDB.js — IndexedDB via idb (npm install idb)
import { openDB } from 'idb';
const DB = 'noteapp_offline', V = 1;
async function db() {
    return openDB(DB, V, { upgrade(d) {
        if (!d.objectStoreNames.contains('notes')) { const s = d.createObjectStore('notes',{keyPath:'id'}); s.createIndex('updated_at','updated_at'); }
        if (!d.objectStoreNames.contains('sync_queue')) d.createObjectStore('sync_queue',{keyPath:'id',autoIncrement:true});
    }});
}
export const getAllNotes   = async () => (await db()).getAll('notes');
export const getNoteById  = async (id) => (await db()).get('notes', Number(id));
export const saveNote     = async (n) => (await db()).put('notes', {...n, id: Number(n.id)});
export const saveNotes    = async (ns) => { const d = await db(); const tx = d.transaction('notes','readwrite'); await Promise.all([...ns.map(n=>tx.store.put({...n,id:Number(n.id)})),tx.done]); };
export const deleteNote   = async (id) => (await db()).delete('notes', Number(id));
export const enqueueSync  = async (op) => (await db()).add('sync_queue', {...op, ts: Date.now()});
export const getAllQueued  = async () => (await db()).getAll('sync_queue');
export const clearQueued  = async (ids) => { const d = await db(); const tx = d.transaction('sync_queue','readwrite'); await Promise.all([...ids.map(id=>tx.store.delete(id)),tx.done]); };
