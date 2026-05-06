import { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
export default function NoteUnlockModal({ note, onUnlocked, onCancel }) {
    const { unlockNote } = useNotes();
    const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [load, setLoad] = useState(false);
    const ref = useRef(); useEffect(()=>ref.current?.focus(),[]);
    const submit = async (e) => {
        e.preventDefault(); if (!pw) return;
        setErr(''); setLoad(true);
        try { await unlockNote(note.id, pw); onUnlocked(); }
        catch(e) { setErr(e.response?.data?.message||'Incorrect password.'); setPw(''); ref.current?.focus(); }
        finally { setLoad(false); }
    };
    return (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.55)',zIndex:1060}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
            <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e=>e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0"><div><div style={{fontSize:32}}>🔒</div><h6 className="modal-title fw-bold mt-2">Protected Note</h6>{note.title&&<p className="text-muted small mb-0">"{note.title.slice(0,40)}{note.title.length>40?'…':''}"</p>}</div></div>
                    <form onSubmit={submit}>
                        <div className="modal-body pt-2">
                            <p className="text-muted small mb-3">Enter the password to access this note.</p>
                            <input ref={ref} type="password" className={`form-control ${err?'is-invalid':''}`} placeholder="Note password" value={pw} onChange={e=>{setPw(e.target.value);setErr('');}} autoComplete="current-password"/>
                            {err && <div className="invalid-feedback d-block">{err}</div>}
                        </div>
                        <div className="modal-footer border-0 pt-0 gap-2">
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={load||!pw}>{load?<><span className="spinner-border spinner-border-sm me-1"/>Unlocking…</>:'Unlock'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
