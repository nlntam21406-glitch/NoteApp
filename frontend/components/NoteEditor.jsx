// src/components/NoteEditor.jsx — shared create/edit modal, NO save button, auto-save 500ms
import { useRef, useCallback, useState, useEffect } from 'react';
import { useNotes }         from '../context/NoteContext';
import { useAutoSave }      from '../hooks/useAutoSave';
import { useCollaboration } from '../hooks/useCollaboration';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import NoteUnlockModal      from './NoteUnlockModal';
import NoteLockManager      from './NoteLockManager';

// LabelPicker inline
function LabelPicker({ note }) {
    const { labels, syncNoteLabels } = useNotes();
    const [open, setOpen] = useState(false);
    const attached = new Set((note.labels||[]).map(l=>l.id));
    const toggle = async id => {
        const next = new Set(attached);
        next.has(id) ? next.delete(id) : next.add(id);
        await syncNoteLabels(note.id, [...next]);
    };
    if (!labels.length) return null;
    return (
        <div className="position-relative d-inline-block">
            <button className="btn btn-outline-secondary btn-sm" style={{fontSize:'0.78rem'}} onClick={()=>setOpen(v=>!v)}>🏷️ Labels</button>
            {open && <>
                <div className="position-fixed top-0 start-0 w-100 h-100" style={{zIndex:10}} onClick={()=>setOpen(false)}/>
                <div className="position-absolute bg-white border rounded shadow-sm p-2" style={{zIndex:11,bottom:'100%',left:0,minWidth:160,marginBottom:4}}>
                    {labels.map(l=>(
                        <div key={l.id} className="form-check mb-1">
                            <input type="checkbox" className="form-check-input" id={`lbl-${l.id}`} checked={attached.has(l.id)} onChange={()=>toggle(l.id)}/>
                            <label className="form-check-label small" htmlFor={`lbl-${l.id}`}>{l.name}</label>
                        </div>
                    ))}
                </div>
            </>}
        </div>
    );
}

export default function NoteEditor({ note, onClose, isShared = false, sharePermission = null }) {
    const { addImages, delImage, pinNote, saveNote } = useNotes();
    const gated       = note.is_locked && !unlockTokenStore.isUnlocked(note.id);
    const [showGate,  setShowGate]  = useState(gated);
    const [showLockMgr, setLockMgr] = useState(false);
    const [collaborators, setCollabs] = useState([]);

    const { title, setTitle, content, setContent, saving, saved } = useAutoSave(note);
    const fileRef = useRef();

    // Real-time collaboration (edit-permission shared notes)
    const canCollab = !isShared || sharePermission === 'edit';
    useCollaboration(note.id, canCollab, (payload) => {
        // Remote peer updated the note — update local state
        if (payload.note_id === note.id) {
            setTitle(payload.title);
            setContent(payload.content);
        }
    });

    const handleImages = useCallback(async e => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        await addImages(note.id, files);
        e.target.value = '';
    }, [note.id, addImages]);

    const handleRemoveImage = useCallback(async url => {
        const path = url.split('/storage/')[1];
        if (path) await delImage(note.id, path);
    }, [note.id, delImage]);

    if (!note) return null;
    if (showGate) return <NoteUnlockModal note={note} onUnlocked={()=>setShowGate(false)} onCancel={onClose}/>;

    const readOnly = isShared && sharePermission === 'read';

    return (
        <>
            <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.5)',zIndex:1055}} onClick={e=>e.target===e.currentTarget&&onClose()}>
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={e=>e.stopPropagation()}>
                    <div className="modal-content" style={{minHeight:420}}>

                        {/* Header */}
                        <div className="modal-header py-2 border-bottom-0">
                            <div className="d-flex align-items-center gap-2 w-100">
                                {!isShared && (
                                    <>
                                        <button className={`btn btn-sm ${note.is_pinned?'btn-warning':'btn-outline-secondary'}`} title={note.is_pinned?'Unpin':'Pin'} onClick={()=>pinNote(note.id)}>📌</button>
                                        <button className={`btn btn-sm ${note.is_locked?'btn-danger':'btn-outline-secondary'}`} title={note.is_locked?'Manage lock':'Lock note'} onClick={()=>setLockMgr(true)}>{note.is_locked?'🔒':'🔓'}</button>
                                    </>
                                )}
                                {readOnly && <span className="badge bg-secondary">Read only</span>}
                                {/* Auto-save status — NO save button */}
                                <span className="ms-auto small" style={{color:saving?'#f59e0b':saved?'#10b981':'transparent',transition:'color 0.3s',minWidth:80,textAlign:'right'}}>
                                    {saving?'● Saving…':saved?'✓ Saved':'·'}
                                </span>
                                <button type="button" className="btn-close ms-2" onClick={onClose}/>
                            </div>
                        </div>

                        {/* Body — EXACTLY 2 fields: title + content */}
                        <div className="modal-body pt-0">
                            <input type="text" className="form-control form-control-lg border-0 shadow-none fw-bold px-0" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{fontSize:'1.4rem',outline:'none'}} readOnly={readOnly}/>
                            <hr className="my-2"/>
                            <textarea className="form-control border-0 shadow-none px-0 w-100" placeholder="Take a note…" value={content} onChange={e=>setContent(e.target.value)} rows={12} style={{resize:'none',outline:'none',fontSize:'1rem'}} readOnly={readOnly}/>

                            {/* Images */}
                            {note.images?.length>0 && (
                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {note.images.map(url=>(
                                        <div key={url} className="position-relative">
                                            <img src={url} alt="" style={{width:100,height:100,objectFit:'cover',borderRadius:8,border:'1px solid #e5e7eb'}}/>
                                            {!readOnly && <button className="btn btn-danger btn-sm position-absolute" style={{top:-6,right:-6,width:20,height:20,padding:0,fontSize:11,borderRadius:'50%',lineHeight:1}} onClick={()=>handleRemoveImage(url)}>×</button>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isShared && <div className="mt-3"><LabelPicker note={note}/></div>}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer py-2 border-top-0 justify-content-start">
                            {!readOnly && <>
                                <input ref={fileRef} type="file" accept="image/*" multiple className="d-none" onChange={handleImages}/>
                                <button className="btn btn-outline-secondary btn-sm" onClick={()=>fileRef.current?.click()}>🖼️ Add image</button>
                            </>}
                            <div className="ms-auto d-flex gap-2 align-items-center small text-muted">
                                {note.is_pinned && <span title="Pinned">📌</span>}
                                {note.is_locked && <span title="Password protected">🔒</span>}
                                {note.is_shared && <span title="Shared">🔗</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showLockMgr && <NoteLockManager note={note} onClose={()=>setLockMgr(false)}/>}
        </>
    );
}
