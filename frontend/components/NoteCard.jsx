import { useState } from 'react';
import { useNotes } from '../context/NoteContext';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import NoteUnlockModal from './NoteUnlockModal';

export function NoteIcons({ note, size = '0.82rem' }) {
    return (
        <span className="d-inline-flex gap-1 align-items-center">
            {note.is_pinned && <span title="Pinned" style={{fontSize:size}}>📌</span>}
            {note.is_locked && <span title="Password protected" style={{fontSize:size}}>🔒</span>}
            {note.is_shared && <span title="Shared" style={{fontSize:size}}>🔗</span>}
        </span>
    );
}

function Labels({ labels }) {
    if (!labels?.length) return null;
    return (
        <div className="d-flex flex-wrap gap-1 mt-2">
            {labels.slice(0,3).map(l=><span key={l.id} className="badge rounded-pill" style={{background:'#e0e7ff',color:'#3730a3',fontSize:'0.7rem'}}>{l.name}</span>)}
            {labels.length>3 && <span className="badge rounded-pill bg-secondary" style={{fontSize:'0.7rem'}}>+{labels.length-3}</span>}
        </div>
    );
}

function useDeleteFlow(note) {
    const { removeNote } = useNotes();
    const [step, setStep] = useState('idle');
    return {
        step,
        start: () => note.is_locked && !unlockTokenStore.isUnlocked(note.id) ? setStep('unlock') : setStep('confirm'),
        onUnlocked: () => setStep('confirm'),
        onConfirm: async () => { await removeNote(note.id); setStep('idle'); },
        onCancel: () => setStep('idle'),
    };
}

function Menu({ note, onPin, onEdit, onDelete, onClose }) {
    return (
        <>
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{zIndex:999}} onClick={onClose} />
            <ul className="dropdown-menu show shadow-sm" style={{zIndex:1000,minWidth:140,right:0,left:'auto'}}>
                <li><button className="dropdown-item small" onClick={onEdit}>✏️ Edit</button></li>
                <li><button className="dropdown-item small" onClick={onPin}>{note.is_pinned?'📌 Unpin':'📌 Pin to top'}</button></li>
                <li><hr className="dropdown-divider"/></li>
                <li><button className="dropdown-item small text-danger" onClick={onDelete}>🗑️ Delete</button></li>
            </ul>
        </>
    );
}

function fmt(iso) {
    if (!iso) return '';
    const d=new Date(iso), now=new Date(), diff=Math.floor((now-d)/86400000);
    if (diff===0) return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if (diff===1) return 'Yesterday';
    if (diff<7)   return d.toLocaleDateString([],{weekday:'short'});
    return d.toLocaleDateString([],{month:'short',day:'numeric'});
}

export function GridCard({ note, onOpen }) {
    const { pinNote } = useNotes();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);
    return (
        <>
            <div className="card note-card-grid h-100" style={{cursor:'pointer',border:note.is_pinned?'2px solid #f59e0b':'1px solid #e5e7eb',borderRadius:12,transition:'box-shadow 0.2s,transform 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='';e.currentTarget.style.transform=''}}
                onClick={()=>onOpen(note)}>
                {note.images?.[0] && <img src={note.images[0]} alt="" className="card-img-top" style={{height:120,objectFit:'cover',borderRadius:'10px 10px 0 0'}}/>}
                <div className="card-body py-2 px-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <NoteIcons note={note}/>
                        <div className="position-relative" onClick={e=>e.stopPropagation()}>
                            <button className="btn btn-sm btn-link text-secondary p-0" style={{lineHeight:1,fontSize:'1.1rem'}} onClick={()=>setMenu(v=>!v)}>⋮</button>
                            {menu && <Menu note={note} onPin={()=>{pinNote(note.id);setMenu(false)}} onEdit={()=>{onOpen(note);setMenu(false)}} onDelete={()=>{del.start();setMenu(false)}} onClose={()=>setMenu(false)}/>}
                        </div>
                    </div>
                    {note.title && <h6 className="card-title mb-1 fw-semibold text-truncate" style={{fontSize:'0.95rem'}}>{note.title}</h6>}
                    {note.content && <p className="card-text text-muted small mb-1" style={{display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{note.content.slice(0,200)}</p>}
                    <Labels labels={note.labels}/>
                    <p className="text-muted mb-0 mt-1" style={{fontSize:'0.7rem'}}>{fmt(note.updated_at)}</p>
                </div>
            </div>
            {del.step==='unlock' && <NoteUnlockModal note={note} onUnlocked={del.onUnlocked} onCancel={del.onCancel}/>}
            <DeleteConfirmDialog open={del.step==='confirm'} noteTitle={note.title} onConfirm={del.onConfirm} onCancel={del.onCancel}/>
        </>
    );
}

export function ListRow({ note, onOpen }) {
    const { pinNote } = useNotes();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);
    return (
        <>
            <div className="note-card-list d-flex align-items-center gap-3 px-3 py-2 rounded-3 mb-2"
                style={{cursor:'pointer',border:note.is_pinned?'1.5px solid #f59e0b':'1px solid #e5e7eb',transition:'background 0.15s'}}
                onClick={()=>onOpen(note)} onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                {note.images?.[0] && <img src={note.images[0]} alt="" style={{width:48,height:48,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
                <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-truncate" style={{fontSize:'0.95rem'}}>{note.title||<span className="text-muted fst-italic">Untitled</span>}</span>
                        <NoteIcons note={note}/>
                    </div>
                    {note.content && <span className="text-muted small text-truncate d-block">{note.content.slice(0,100)}</span>}
                    <Labels labels={note.labels}/>
                </div>
                <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0" onClick={e=>e.stopPropagation()}>
                    <span className="text-muted" style={{fontSize:'0.7rem'}}>{fmt(note.updated_at)}</span>
                    <div className="position-relative">
                        <button className="btn btn-sm btn-link text-secondary p-0" onClick={()=>setMenu(v=>!v)}>⋮</button>
                        {menu && <Menu note={note} onPin={()=>{pinNote(note.id);setMenu(false)}} onEdit={()=>{onOpen(note);setMenu(false)}} onDelete={()=>{del.start();setMenu(false)}} onClose={()=>setMenu(false)}/>}
                    </div>
                </div>
            </div>
            {del.step==='unlock' && <NoteUnlockModal note={note} onUnlocked={del.onUnlocked} onCancel={del.onCancel}/>}
            <DeleteConfirmDialog open={del.step==='confirm'} noteTitle={note.title} onConfirm={del.onConfirm} onCancel={del.onCancel}/>
        </>
    );
}
