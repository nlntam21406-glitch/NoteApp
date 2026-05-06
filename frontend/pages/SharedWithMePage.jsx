// Recipient view: all notes shared with the current user
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSharedWithMe } from '../api/shareApi';
import NoteEditor from '../components/NoteEditor';
import { NoteProvider, useNotes } from '../context/NoteContext';

function fmt(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function SharedWithMeInner() {
    const [shares,      setShares]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [activeShare, setActiveShare] = useState(null); // { note, permission }

    useEffect(() => {
        getSharedWithMe()
            .then(({ data }) => setShares(data.shares))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container py-4" style={{ maxWidth: 900 }}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <a href="/" className="btn btn-outline-secondary btn-sm">← My Notes</a>
                <h4 className="fw-bold mb-0">🔗 Shared with me</h4>
            </div>

            {loading && <div className="text-center py-5"><div className="spinner-border text-primary"/></div>}

            {!loading && shares.length === 0 && (
                <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
                    <h5 className="fw-semibold">No shared notes</h5>
                    <p className="small">When someone shares a note with you, it will appear here.</p>
                </div>
            )}

            {/* Each shared note row — shows: note, who shared, when, permission */}
            {shares.map(s => (
                <div key={s.share_id} className="card mb-3 shadow-sm"
                    style={{ cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: 10 }}
                    onClick={() => setActiveShare(s)}>
                    <div className="card-body py-3 px-4">
                        <div className="d-flex align-items-start justify-content-between gap-3">
                            <div className="flex-grow-1 overflow-hidden">
                                <h6 className="fw-bold mb-1 text-truncate">
                                    {s.note.title || <span className="text-muted fst-italic">Untitled</span>}
                                </h6>
                                {s.note.content && (
                                    <p className="text-muted small mb-2 text-truncate" style={{ maxWidth: 500 }}>
                                        {s.note.content.slice(0, 120)}
                                    </p>
                                )}
                                {/* Labels */}
                                {s.note.labels?.length > 0 && (
                                    <div className="d-flex flex-wrap gap-1 mb-2">
                                        {s.note.labels.map(l => (
                                            <span key={l.id} className="badge rounded-pill"
                                                style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem' }}>
                                                {l.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* Share metadata (requirement: show who, when, permission) */}
                                <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.75rem' }}>
                                    <span className="text-muted">
                                        👤 Shared by <strong>{s.shared_by.display_name}</strong> ({s.shared_by.email})
                                    </span>
                                    <span className="text-muted">📅 {fmt(s.shared_at)}</span>
                                    <span className={`badge ${s.permission === 'edit' ? 'bg-success' : 'bg-secondary'}`}
                                        style={{ fontSize: '0.7rem' }}>
                                        {s.permission === 'edit' ? '✏️ Can edit' : '👁 Read only'}
                                    </span>
                                </div>
                            </div>
                            {s.note.images?.[0] && (
                                <img src={s.note.images[0]} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Open shared note in editor */}
            {activeShare && (
                <NoteEditor
                    note={activeShare.note}
                    onClose={() => setActiveShare(null)}
                    isShared={true}
                    sharePermission={activeShare.permission}
                />
            )}
        </div>
    );
}

export default function SharedWithMePage() {
    return <NoteProvider><SharedWithMeInner /></NoteProvider>;
}
