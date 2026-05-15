import { useState, useEffect } from 'react';
import { Share2, X } from 'lucide-react';
import { getShares, shareNote, updateShare, revokeShare } from '../api/shareApi';
export default function ShareManager({ note, onClose }) {
    const [shares, setShares] = useState([]);
    const [email, setEmail]   = useState('');
    const [perm, setPerm]     = useState('read');
    const [err, setErr]       = useState('');
    const [msg, setMsg]       = useState('');
    const [load, setLoad]     = useState(false);

    useEffect(() => { getShares(note.id).then(({data})=>setShares(data.shares)).catch(()=>{}); }, [note.id]);

    const doShare = async e => {
        e.preventDefault(); setErr(''); setMsg(''); setLoad(true);
        try {
            const {data} = await shareNote(note.id, email, perm);
            setShares(p => { const existing=p.findIndex(s=>s.id===data.share.id); return existing>=0?p.map((s,i)=>i===existing?data.share:s):[...p,data.share]; });
            setMsg(data.message); setEmail('');
        } catch(e) { setErr(e.response?.data?.errors?.email?.[0]||e.response?.data?.message||'Error'); }
        finally { setLoad(false); }
    };

    const doUpdate = async (shareId, permission) => {
        await updateShare(note.id, shareId, permission);
        setShares(p=>p.map(s=>s.id===shareId?{...s,permission}:s));
    };

    const doRevoke = async shareId => {
        await revokeShare(note.id, shareId);
        setShares(p=>p.filter(s=>s.id!==shareId));
    };

    return (
        <div className="modal d-block" style={{backgroundColor:'rgba(0,0,0,0.5)',zIndex:1060}} onClick={e=>e.target===e.currentTarget&&onClose()}>
            <div className="modal-dialog modal-dialog-centered" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header border-0 pb-0"><h6 className="modal-title fw-bold d-flex align-items-center gap-2"><Share2 size={15} strokeWidth={2}/>Share Note</h6><button type="button" className="btn-close" onClick={onClose}/></div>
                    <div className="modal-body">
                        {msg && <div className="alert alert-success py-2 small">{msg}</div>}
                        {err && <div className="alert alert-danger py-2 small">{err}</div>}
                        <form onSubmit={doShare} className="d-flex gap-2 mb-4">
                            <input type="email" className="form-control form-control-sm" placeholder="Recipient email" value={email} onChange={e=>{setEmail(e.target.value);setErr('');}} required style={{flex:'1 1 auto'}}/>
                            <select className="form-select form-select-sm" value={perm} onChange={e=>setPerm(e.target.value)} style={{width:110,flexShrink:0}}>
                                <option value="read">Read only</option>
                                <option value="edit">Can edit</option>
                            </select>
                            <button type="submit" className="btn btn-primary btn-sm" disabled={load}>{load?'…':'Share'}</button>
                        </form>

                        {shares.length>0 && <>
                            <h6 className="small fw-semibold text-muted text-uppercase" style={{letterSpacing:'0.05em'}}>Shared with</h6>
                            {shares.map(s=>(
                                <div key={s.id} className="d-flex align-items-center gap-2 py-2 border-bottom">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-semibold small text-truncate">{s.recipient?.display_name}</div>
                                        <div className="text-muted" style={{fontSize:'0.75rem'}}>{s.recipient?.email}</div>
                                        <div className="text-muted" style={{fontSize:'0.7rem'}}>Shared {new Date(s.shared_at).toLocaleDateString()}</div>
                                    </div>
                                    <select className="form-select form-select-sm" value={s.permission} style={{width:110}} onChange={e=>doUpdate(s.id,e.target.value)}>
                                        <option value="read">Read only</option>
                                        <option value="edit">Can edit</option>
                                    </select>
                                    <button className="btn btn-sm btn-outline-danger" title="Revoke" onClick={()=>doRevoke(s.id)}>✕</button>
                                </div>
                            ))}
                        </>}
                        {shares.length===0 && <p className="text-muted small text-center py-2">Not shared with anyone yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
