// Recipient view: all notes shared with the current user
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSharedWithMe } from '../api/shareApi';
import NoteEditor from '../components/NoteEditor';
import { NoteProvider } from '../context/NoteContext';

function fmt(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function SharedWithMeInner() {
    const [shares,      setShares]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [activeShare, setActiveShare] = useState(null);

    useEffect(() => {
        getSharedWithMe()
            .then(({ data }) => setShares(data.shares))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-base)' }}>
            {/* Header bar */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                position: 'sticky',
                top: 0,
                zIndex: 10,
                boxShadow: 'var(--shadow-sm)',
            }}>
                <Link
                    to="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'var(--transition)',
                    }}
                    id="back-to-notes-link"
                >
                    ← My Notes
                </Link>
                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                    🔗 Shared with me
                </h1>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div className="spinner-border text-primary" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && shares.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>🔗</div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
                            No shared notes
                        </h2>
                        <p style={{ fontSize: '0.9rem' }}>
                            When someone shares a note with you, it will appear here.
                        </p>
                    </div>
                )}

                {/* Shared note cards — shows: note, who shared, when, permission */}
                {shares.map(s => (
                    <div
                        key={s.share_id}
                        onClick={() => setActiveShare(s)}
                        style={{
                            background: 'var(--surface)',
                            border: '1.5px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px',
                            marginBottom: 12,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 16,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}
                        id={`shared-note-${s.share_id}`}
                    >
                        <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                            {/* Note title */}
                            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: 4, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.note.title || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Untitled</span>}
                            </h3>

                            {/* Content preview */}
                            {s.note.content && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                                    {s.note.content.slice(0, 120)}
                                </p>
                            )}

                            {/* Labels */}
                            {s.note.labels?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                                    {s.note.labels.map(l => (
                                        <span key={l.id} className="badge"
                                            style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.68rem' }}>
                                            {l.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Share metadata: who shared, when, permission */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    👤 Shared by <strong style={{ color: 'var(--text)' }}>{s.shared_by.display_name}</strong>
                                    <span style={{ opacity: 0.6 }}> ({s.shared_by.email})</span>
                                </span>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    📅 {fmt(s.shared_at)}
                                </span>
                                <span
                                    className="badge"
                                    style={{
                                        background: s.permission === 'edit' ? '#d1fae5' : 'var(--surface-2)',
                                        color: s.permission === 'edit' ? '#065f46' : 'var(--text-muted)',
                                        fontSize: '0.72rem',
                                    }}
                                >
                                    {s.permission === 'edit' ? '✏️ Can edit' : '👁 Read only'}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail */}
                        {s.note.images?.[0] && (
                            <img src={s.note.images[0]} alt=""
                                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                        )}
                    </div>
                ))}
            </div>

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
