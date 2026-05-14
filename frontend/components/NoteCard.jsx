import { useState } from 'react';
import { useNotes } from '../context/NoteContext';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import NoteUnlockModal from './NoteUnlockModal';

export function NoteIcons({ note, size = '0.82rem' }) {
    return (
        <span className="d-inline-flex gap-1 align-items-center">
            {note.is_pinned && <span title="Pinned" style={{ fontSize: size }}>📌</span>}
            {note.is_locked && <span title="Password protected" style={{ fontSize: size }}>🔒</span>}
            {note.is_shared && <span title="Shared" style={{ fontSize: size }}>🔗</span>}
        </span>
    );
}

function Labels({ labels }) {
    if (!labels?.length) return null;
    return (
        <div className="d-flex flex-wrap gap-1 mt-2">
            {labels.slice(0, 3).map(l => (
                <span key={l.id} className="badge"
                    style={{ background: '#ede9fe', color: '#6d28d9', fontSize: '0.68rem', fontWeight: 500 }}>
                    {l.name}
                </span>
            ))}
            {labels.length > 3 && (
                <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                    +{labels.length - 3}
                </span>
            )}
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
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 999 }} onClick={onClose} />
            <ul className="dropdown-menu show" style={{ zIndex: 1000, minWidth: 150, right: 0, left: 'auto', top: '100%' }}>
                <li><button className="dropdown-item small" onClick={onEdit}>✏️ Edit</button></li>
                <li><button className="dropdown-item small" onClick={onPin}>{note.is_pinned ? '📌 Unpin' : '📌 Pin to top'}</button></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item small text-danger" onClick={onDelete}>🗑️ Delete</button></li>
            </ul>
        </>
    );
}

function fmt(iso) {
    if (!iso) return '';
    const d = new Date(iso), now = new Date(), diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function GridCard({ note, onOpen }) {
    const { pinNote } = useNotes();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);

    const pinnedBorder = note.is_pinned ? '2px solid var(--warning)' : '1.5px solid var(--border)';

    return (
        <>
            <div
                className="card note-card-grid h-100"
                style={{ cursor: 'pointer', border: pinnedBorder, borderRadius: 'var(--radius-md)' }}
                onClick={() => onOpen(note)}
            >
                {/* Thumbnail image */}
                {note.images?.[0] && (
                    <img src={note.images[0]} alt="" className="card-img-top"
                        style={{ height: 130, objectFit: 'cover', borderRadius: 'calc(var(--radius-md) - 1.5px) calc(var(--radius-md) - 1.5px) 0 0' }} />
                )}

                <div className="card-body py-2 px-3">
                    {/* Icons row + menu */}
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <NoteIcons note={note} />
                        <div className="position-relative" onClick={e => e.stopPropagation()}>
                            <button
                                className="btn btn-sm btn-link text-secondary p-0"
                                style={{ lineHeight: 1, fontSize: '1.2rem', opacity: 0.6 }}
                                onClick={() => setMenu(v => !v)}
                                id={`grid-menu-${note.id}`}
                            >
                                ⋮
                            </button>
                            {menu && (
                                <Menu
                                    note={note}
                                    onPin={() => { pinNote(note.id); setMenu(false); }}
                                    onEdit={() => { onOpen(note); setMenu(false); }}
                                    onDelete={() => { del.start(); setMenu(false); }}
                                    onClose={() => setMenu(false)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    {note.title && (
                        <h6 className="card-title mb-1 fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                            {note.title}
                        </h6>
                    )}

                    {/* Content preview */}
                    {note.content && (
                        <p className="card-text text-muted small mb-1"
                            style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                            {note.content.slice(0, 200)}
                        </p>
                    )}

                    <Labels labels={note.labels} />

                    {/* Timestamp */}
                    <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.7rem' }}>
                        {fmt(note.updated_at)}
                    </p>
                </div>
            </div>

            {del.step === 'unlock' && <NoteUnlockModal note={note} onUnlocked={del.onUnlocked} onCancel={del.onCancel} />}
            <DeleteConfirmDialog open={del.step === 'confirm'} noteTitle={note.title} onConfirm={del.onConfirm} onCancel={del.onCancel} />
        </>
    );
}

export function ListRow({ note, onOpen }) {
    const { pinNote } = useNotes();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);

    const pinnedBorder = note.is_pinned ? '1.5px solid var(--warning)' : '1.5px solid var(--border)';

    return (
        <>
            <div
                className="note-card-list d-flex align-items-center gap-3 px-3 py-2 rounded-3 mb-2"
                style={{ cursor: 'pointer', border: pinnedBorder }}
                onClick={() => onOpen(note)}
            >
                {/* Thumbnail */}
                {note.images?.[0] && (
                    <img src={note.images[0]} alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}

                <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                            {note.title || <span className="text-muted fst-italic">Untitled</span>}
                        </span>
                        <NoteIcons note={note} />
                    </div>
                    {note.content && (
                        <span className="text-muted small text-truncate d-block" style={{ lineHeight: 1.4 }}>
                            {note.content.slice(0, 100)}
                        </span>
                    )}
                    <Labels labels={note.labels} />
                </div>

                {/* Right side: time + menu */}
                <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>{fmt(note.updated_at)}</span>
                    <div className="position-relative">
                        <button
                            className="btn btn-sm btn-link text-secondary p-0"
                            style={{ opacity: 0.6 }}
                            onClick={() => setMenu(v => !v)}
                            id={`list-menu-${note.id}`}
                        >
                            ⋮
                        </button>
                        {menu && (
                            <Menu
                                note={note}
                                onPin={() => { pinNote(note.id); setMenu(false); }}
                                onEdit={() => { onOpen(note); setMenu(false); }}
                                onDelete={() => { del.start(); setMenu(false); }}
                                onClose={() => setMenu(false)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {del.step === 'unlock' && <NoteUnlockModal note={note} onUnlocked={del.onUnlocked} onCancel={del.onCancel} />}
            <DeleteConfirmDialog open={del.step === 'confirm'} noteTitle={note.title} onConfirm={del.onConfirm} onCancel={del.onCancel} />
        </>
    );
}
