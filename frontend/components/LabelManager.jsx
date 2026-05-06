import { useState } from 'react';
import { useNotes } from '../context/NoteContext';
export default function LabelManager() {
    const { labels, createLabel, renameLabel, removeLabel, filterLabel, filterByLabel } = useNotes();
    const [newName, setNew] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const submit = async e => { e.preventDefault(); if (!newName.trim()) return; await createLabel(newName.trim()); setNew(''); };
    const saveRename = async id => { if (!editName.trim()) return; await renameLabel(id, editName.trim()); setEditId(null); };
    return (
        <div>
            <h6 className="fw-semibold mb-2 px-2" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em',color:'#6b7280'}}>Labels</h6>
            <button className={`btn btn-sm w-100 text-start mb-1 ${filterLabel===null?'btn-primary':'btn-link text-dark'}`} style={{fontSize:'0.85rem'}} onClick={()=>filterByLabel(null)}>All notes</button>
            {labels.map(l=>(
                <div key={l.id} className="d-flex align-items-center gap-1 mb-1">
                    {editId===l.id ? <>
                        <input className="form-control form-control-sm" value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveRename(l.id);if(e.key==='Escape')setEditId(null)}} autoFocus/>
                        <button className="btn btn-sm btn-success px-1 py-0" onClick={()=>saveRename(l.id)}>✓</button>
                        <button className="btn btn-sm btn-outline-secondary px-1 py-0" onClick={()=>setEditId(null)}>✕</button>
                    </> : <>
                        <button className={`btn btn-sm flex-grow-1 text-start ${filterLabel===l.id?'btn-primary':'btn-link text-dark'}`} style={{fontSize:'0.85rem'}} onClick={()=>filterByLabel(l.id)}>🏷️ {l.name}{l.notes_count!=null&&<span className="ms-1 text-muted" style={{fontSize:'0.7rem'}}>({l.notes_count})</span>}</button>
                        <button className="btn btn-sm btn-link text-secondary p-0" title="Rename" style={{fontSize:'0.75rem'}} onClick={()=>{setEditId(l.id);setEditName(l.name)}}>✏️</button>
                        <button className="btn btn-sm btn-link text-danger p-0" title="Delete" style={{fontSize:'0.75rem'}} onClick={()=>removeLabel(l.id)}>✕</button>
                    </>}
                </div>
            ))}
            <form onSubmit={submit} className="d-flex gap-1 mt-2">
                <input type="text" className="form-control form-control-sm" placeholder="New label…" value={newName} onChange={e=>setNew(e.target.value)} style={{fontSize:'0.82rem'}}/>
                <button type="submit" className="btn btn-sm btn-outline-primary px-2">+</button>
            </form>
        </div>
    );
}
