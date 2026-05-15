// src/context/NoteContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as noteApi from '../api/noteApi';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import { saveNotes, getAllNotes, enqueueSync } from '../db/noteDB';
import { requestBackgroundSync } from '../utils/pwa';

const NoteContext = createContext(null);
const sort = ns => [...ns].sort((a,b) => {
    if (a.is_pinned&&!b.is_pinned) return -1; if (!a.is_pinned&&b.is_pinned) return 1;
    if (a.is_pinned&&b.is_pinned) return new Date(b.pinned_at)-new Date(a.pinned_at);
    return new Date(b.updated_at)-new Date(a.updated_at);
});

export function NoteProvider({ children }) {
    const [allNotes,    setAllNotes] = useState([]);
    const [notes,       setNotes]  = useState([]);
    const [labels,      setLabels] = useState([]);
    const [loading,     setLoad]   = useState(true);
    const [searchQuery, setSearch] = useState('');
    const [filterLabel, setFilter] = useState(null);
    const [viewMode,    setView]   = useState(() => localStorage.getItem('viewMode')||'grid');
    const [isOnline,    setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const on = () => setOnline(true); const off = () => setOnline(false);
        window.addEventListener('online',on); window.addEventListener('offline',off);
        return () => { window.removeEventListener('online',on); window.removeEventListener('offline',off); };
    },[]);

    // Client-side filter helper
    const applyFilters = useCallback((raw, q, labelId) => {
        let result = raw;
        if (labelId != null) {
            result = result.filter(n => n.labels?.some(l => l.id === labelId));
        }
        if (q && q.trim()) {
            const lower = q.toLowerCase();
            result = result.filter(n =>
                (n.title || '').toLowerCase().includes(lower) ||
                (n.content || '').toLowerCase().includes(lower) ||
                n.labels?.some(l => l.name.toLowerCase().includes(lower))
            );
        }
        return result;
    }, []);

    const loadNotes = useCallback(async () => {
        setLoad(true);
        try {
            if (navigator.onLine) {
                const {data} = await noteApi.fetchNotes({});
                setAllNotes(data.notes);
                setNotes(sort(applyFilters(data.notes, searchQuery, filterLabel)));
                await saveNotes(data.notes);
            } else {
                const cached = await getAllNotes();
                setAllNotes(cached);
                setNotes(sort(applyFilters(cached, searchQuery, filterLabel)));
            }
        } catch {
            const cached = await getAllNotes();
            setAllNotes(cached);
            setNotes(sort(applyFilters(cached, searchQuery, filterLabel)));
        }
        finally { setLoad(false); }
    }, [applyFilters, searchQuery, filterLabel]);

    const loadLabels = useCallback(async () => { const {data} = await noteApi.fetchLabels(); setLabels(data.labels); }, []);
    useEffect(() => { loadNotes(); loadLabels(); }, []);

    // Listen for sync events
    useEffect(() => {
        const h = e => { if (e.detail) setNotes(e.detail); };
        window.addEventListener('notes-synced', h);
        return () => window.removeEventListener('notes-synced', h);
    }, []);

    const toggleView  = useCallback(() => setView(v => { const n = v==='grid'?'list':'grid'; localStorage.setItem('viewMode',n); return n; }), []);
    const addNote     = useCallback(async () => {
        const {data} = await noteApi.createNote({title:'',content:''});
        const newNote = data.note;
        setAllNotes(p => [newNote, ...p]);
        setNotes(p => sort([newNote, ...p]));
        return newNote;
    }, []);

    const saveNote = useCallback(async (id, fields) => {
        if (navigator.onLine) {
            const {data} = await noteApi.updateNote(id, fields);
            setAllNotes(p => p.map(n => n.id===id ? data.note : n));
            setNotes(p => p.map(n => n.id===id ? data.note : n));
            return data.note;
        } else {
            await enqueueSync({type:'update', noteId:id, data: fields});
            const base = allNotes.find(n=>n.id===id);
            const updated = {...base, ...fields, updated_at: new Date().toISOString()};
            setAllNotes(p => p.map(n => n.id===id ? updated : n));
            setNotes(p => p.map(n => n.id===id ? updated : n));
            requestBackgroundSync();
            return updated;
        }
    }, [allNotes]);

    const removeNote = useCallback(async (id) => {
        if (navigator.onLine) { await noteApi.deleteNote(id); }
        else { await enqueueSync({type:'delete', noteId:id}); requestBackgroundSync(); }
        setAllNotes(p => p.filter(n => n.id!==id));
        setNotes(p => p.filter(n => n.id!==id));
        unlockTokenStore.clear(id);
    }, []);

    const pinNote    = useCallback(async (id) => { const {data} = await noteApi.togglePin(id); setAllNotes(p=>sort(p.map(n=>n.id===id?data.note:n))); setNotes(p=>sort(p.map(n=>n.id===id?data.note:n))); }, []);
    const addImages  = useCallback(async (nId, files) => { const {data} = await noteApi.uploadImages(nId,files); setNotes(p=>p.map(n=>n.id===nId?{...n,images:data.images}:n)); }, []);
    const delImage   = useCallback(async (nId, path) => { await noteApi.removeImage(nId,path); setNotes(p=>p.map(n=>n.id===nId?{...n,images:n.images.filter(i=>!i.includes(path))}:n)); }, []);

    const unlockNote = useCallback(async (nId, pw) => { const {data} = await noteApi.verifyLock(nId,pw); unlockTokenStore.set(nId,data.unlock_token); return data; }, []);
    const enableLock = useCallback(async (nId, pw, pwc) => { const {data} = await noteApi.enableLock(nId,pw,pwc); setNotes(p=>p.map(n=>n.id===nId?{...n,is_locked:true}:n)); return data; }, []);
    const changeLock = useCallback(async (nId, cur, pw, pwc) => { const {data} = await noteApi.changeLock(nId,cur,pw,pwc); unlockTokenStore.clear(nId); return data; }, []);
    const disableLock = useCallback(async (nId, cur) => { const {data} = await noteApi.disableLock(nId,cur); unlockTokenStore.clear(nId); setNotes(p=>p.map(n=>n.id===nId?{...n,is_locked:false}:n)); return data; }, []);

    const createLabel = useCallback(async (name) => { const {data} = await noteApi.createLabel(name); setLabels(p=>[...p,data.label].sort((a,b)=>a.name.localeCompare(b.name))); return data.label; }, []);
    const renameLabel = useCallback(async (id, name) => { await noteApi.updateLabel(id,name); setLabels(p=>p.map(l=>l.id===id?{...l,name}:l)); setNotes(p=>p.map(n=>({...n,labels:n.labels.map(l=>l.id===id?{...l,name}:l)}))); }, []);
    const removeLabel = useCallback(async (id) => { await noteApi.deleteLabel(id); setLabels(p=>p.filter(l=>l.id!==id)); if (filterLabel===id) setFilter(null); setNotes(p=>p.map(n=>({...n,labels:n.labels.filter(l=>l.id!==id)}))); }, [filterLabel]);
    const syncNoteLabels = useCallback(async (nId, ids) => {
        const {data} = await noteApi.syncLabels(nId,ids);
        const updater = p => p.map(n => n.id===nId ? {...n, labels: data.labels} : n);
        setAllNotes(updater);
        setNotes(updater);
        // Recalculate label notes_count from updated allNotes
        setAllNotes(currentAll => {
            const updated = currentAll.map(n => n.id===nId ? {...n, labels: data.labels} : n);
            setLabels(prevLabels => prevLabels.map(l => ({
                ...l,
                notes_count: updated.filter(n => n.labels?.some(nl => nl.id === l.id)).length,
            })));
            return updated;
        });
    }, []);

    const search       = useCallback((q) => {
        setSearch(q);
        setNotes(sort(applyFilters(allNotes, q, filterLabel)));
    }, [applyFilters, allNotes, filterLabel]);

    const filterByLabel = useCallback((id) => {
        setFilter(id);
        setNotes(sort(applyFilters(allNotes, searchQuery, id)));
    }, [applyFilters, allNotes, searchQuery]);

    return (
        <NoteContext.Provider value={{ notes, labels, loading, viewMode, toggleView, searchQuery, filterLabel, isOnline,
            addNote, saveNote, removeNote, pinNote, addImages, delImage,
            unlockNote, enableLock, changeLock, disableLock,
            createLabel, renameLabel, removeLabel, syncNoteLabels,
            search, filterByLabel, loadNotes, loadLabels }}>
            {children}
        </NoteContext.Provider>
    );
}
export const useNotes = () => useContext(NoteContext);
