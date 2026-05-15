import { useState } from 'react';
import { Lock, KeyRound, LockOpen } from 'lucide-react';
import { useNotes } from '../context/NoteContext';

function Field({ label, name, value, onChange, error, autoFocus }) {
    return (
        <div className="mb-3">
            <label className="form-label small fw-semibold">{label}</label>
            <input type="password" name={name} className={`form-control form-control-sm ${error?'is-invalid':''}`} value={value} onChange={onChange} autoFocus={autoFocus} autoComplete="new-password"/>
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}

function EnableForm({ noteId, onDone, onCancel }) {
    const { enableLock } = useNotes();
    const [pw, setPw] = useState(''); const [pc, setPc] = useState(''); const [errs, setErrs] = useState({}); const [load, setLoad] = useState(false);
    const submit = async e => {
        e.preventDefault(); const err = {};
        if (pw.length<4) err.pw='At least 4 characters.'; if (pw!==pc) err.pc='Passwords do not match.';
        if (Object.keys(err).length) { setErrs(err); return; }
        setLoad(true);
        try { await enableLock(noteId, pw, pc); onDone('Password protection enabled.'); }
        catch(e) { setErrs({gen: e.response?.data?.message||'Error'}); } finally { setLoad(false); }
    };
    return <form onSubmit={submit}><p className="text-muted small mb-3">Set a password for this note.</p>{errs.gen&&<div className="alert alert-danger py-1 small">{errs.gen}</div>}
        <Field label="New password" name="pw" value={pw} onChange={e=>{setPw(e.target.value);setErrs({})}} error={errs.pw} autoFocus/>
        <Field label="Confirm password" name="pc" value={pc} onChange={e=>{setPc(e.target.value);setErrs({})}} error={errs.pc}/>
        <div className="d-flex gap-2 justify-content-end"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary btn-sm" disabled={load}>{load?'Enabling…':'Enable Lock'}</button></div>
    </form>;
}

function ChangeForm({ noteId, onDone, onCancel }) {
    const { changeLock } = useNotes();
    const [cur, setCur] = useState(''); const [pw, setPw] = useState(''); const [pc, setPc] = useState(''); const [errs, setErrs] = useState({}); const [load, setLoad] = useState(false);
    const submit = async e => {
        e.preventDefault(); const err = {};
        if (!cur) err.cur='Required.'; if (pw.length<4) err.pw='At least 4 characters.'; if (pw!==pc) err.pc='Do not match.';
        if (Object.keys(err).length) { setErrs(err); return; }
        setLoad(true);
        try { await changeLock(noteId, cur, pw, pc); onDone('Password changed. Please unlock the note again.'); }
        catch(e) { setErrs({cur: e.response?.data?.errors?.current_password?.[0]||e.response?.data?.message}); } finally { setLoad(false); }
    };
    return <form onSubmit={submit}><p className="text-muted small mb-3">Enter current password, then set a new one.</p>
        <Field label="Current password" name="cur" value={cur} onChange={e=>{setCur(e.target.value);setErrs({})}} error={errs.cur} autoFocus/>
        <Field label="New password" name="pw" value={pw} onChange={e=>{setPw(e.target.value);setErrs({})}} error={errs.pw}/>
        <Field label="Confirm new password" name="pc" value={pc} onChange={e=>{setPc(e.target.value);setErrs({})}} error={errs.pc}/>
        <div className="d-flex gap-2 justify-content-end"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-primary btn-sm" disabled={load}>{load?'Changing…':'Change Password'}</button></div>
    </form>;
}

function DisableForm({ noteId, onDone, onCancel }) {
    const { disableLock } = useNotes();
    const [cur, setCur] = useState(''); const [err, setErr] = useState(''); const [load, setLoad] = useState(false);
    const submit = async e => {
        e.preventDefault(); if (!cur) { setErr('Required.'); return; }
        setLoad(true);
        try { await disableLock(noteId, cur); onDone('Password protection removed.'); }
        catch(e) { setErr(e.response?.data?.message||'Incorrect password.'); } finally { setLoad(false); }
    };
    return <form onSubmit={submit}><p className="text-muted small mb-3">Enter current password to remove protection.</p>{err&&<div className="alert alert-danger py-1 small">{err}</div>}
        <Field label="Current password" name="cur" value={cur} onChange={e=>{setCur(e.target.value);setErr('')}} error={''} autoFocus/>
        <div className="d-flex gap-2 justify-content-end"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={onCancel}>Cancel</button><button type="submit" className="btn btn-danger btn-sm" disabled={load}>{load?'Removing…':'Remove Lock'}</button></div>
    </form>;
}

export default function NoteLockManager({ note, onClose }) {
    const [tab, setTab] = useState(note.is_locked?'change':'enable');
    const [msg, setMsg] = useState('');
    const done = m => { setMsg(m); setTimeout(onClose, 2000); };
    return (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.5)',zIndex:1060}} onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0">
                        <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                            <Lock size={15} strokeWidth={2} />
                            {note.is_locked ? 'Manage Lock' : 'Lock Note'}
                        </h6>
                        <button type="button" className="btn-close" onClick={onClose}/>
                    </div>
                    <div className="modal-body">
                        {msg ? <div className="alert alert-success py-2 text-center">✓ {msg}</div> : <>
                            {note.is_locked && <ul className="nav nav-pills mb-3 nav-fill" style={{fontSize:'0.82rem'}}>
                                {[
                                    ['change', <><KeyRound size={13} className="me-1" />Change Password</>],
                                    ['disable', <><LockOpen size={13} className="me-1" />Remove Lock</>]
                                ].map(([k,l])=>(
                                    <li key={k} className="nav-item"><button className={`nav-link py-1 d-flex align-items-center justify-content-center gap-1 ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button></li>))}
                            </ul>}
                            {tab==='enable'  && <EnableForm  noteId={note.id} onDone={done} onCancel={onClose}/>}
                            {tab==='change'  && <ChangeForm  noteId={note.id} onDone={done} onCancel={onClose}/>}
                            {tab==='disable' && <DisableForm noteId={note.id} onDone={done} onCancel={onClose}/>}
                        </>}
                    </div>
                </div>
            </div>
        </div>
    );
}
