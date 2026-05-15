import { useState } from 'react';
import { Pin, Lock, Share2, MoreVertical, Pencil, PinOff, Trash2 } from 'lucide-react';
import { useNotes } from '../context/NoteContext';
import { useAuth } from '../context/AuthContext';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import NoteUnlockModal from './NoteUnlockModal';

export function NoteIcons({ note, size = 13 }) {
    return (
        <span className="d-inline-flex gap-1 align-items-center">
            {note.is_pinned && (
                <span title="Pinned" className="note-status-icon note-status-pin">
                    <Pin size={size} strokeWidth={2.2} />
                </span>
            )}
            {note.is_locked && (
                <span title="Password protected" className="note-status-icon note-status-lock">
                    <Lock size={size} strokeWidth={2.2} />
                </span>
            )}
            {note.is_shared && (
                <span title="Shared" className="note-status-icon note-status-share">
                    <Share2 size={size} strokeWidth={2.2} />
                </span>
            )}
        </span>
    );
}

/* Convert a light pastel hex color to a dark equivalent for dark mode */
function adaptColorForTheme(hex, isDark) {
    if (!isDark) return hex;
    if (!hex || hex === '#ffffff') return 'var(--surface)';

    // Parse hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // RGB to HSL
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
    }

    // If the color is nearly white/gray (very low saturation), use surface
    if (s < 0.05) return 'var(--surface)';

    // Dark mode: keep hue, lower saturation, set lightness to ~15%
    const darkL = 15;
    const darkS = Math.round(s * 100 * 0.45);
    const darkH = Math.round(h * 360);
    return `hsl(${darkH}, ${darkS}%, ${darkL}%)`;
}

function Labels({ labels }) {
    if (!labels?.length) return null;
    return (
        <div className="d-flex flex-wrap gap-1 mt-2">
            {labels.slice(0, 3).map(l => (
                <span key={l.id} className="badge"
                    style={{ background: 'var(--badge-bg)', color: 'var(--badge-color)', fontSize: '0.68rem', fontWeight: 500 }}>
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
            <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1998 }} onClick={onClose} />
            <ul className="dropdown-menu show" style={{ zIndex: 1999, minWidth: 160, right: 0, left: 'auto', top: '100%', position: 'absolute' }}>
                <li>
                    <button className="dropdown-item small d-flex align-items-center gap-2" onClick={onEdit}>
                        <Pencil size={13} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                        Edit
                    </button>
                </li>
                <li>
                    <button className="dropdown-item small d-flex align-items-center gap-2" onClick={onPin}>
                        {note.is_pinned
                            ? <PinOff size={13} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                            : <Pin size={13} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                        }
                        {note.is_pinned ? 'Unpin' : 'Pin to top'}
                    </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <button className="dropdown-item small text-danger d-flex align-items-center gap-2" onClick={onDelete}>
                        <Trash2 size={13} strokeWidth={2} />
                        Delete
                    </button>
                </li>
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
    const { user } = useAuth();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);

    const prefs = user?.preferences ?? {};
    const isDark = prefs.theme === 'dark';
    const rawColor = note.color || prefs.noteColor || '#ffffff';
    
    // In dark mode, we use surface background and a colored left border.
    // In light mode, we use the pastel background color.
    const noteColor = isDark ? 'var(--surface)' : adaptColorForTheme(rawColor, false);
    const borderLeftColor = isDark && rawColor !== '#ffffff' ? adaptColorForTheme(rawColor, true) : null;
    
    const fontSizeMap = { small: '0.82rem', medium: '0.9rem', large: '1rem' };
    const fontSize = fontSizeMap[prefs.fontSize] || '0.9rem';

    const pinnedBorder = note.is_pinned ? '1px solid var(--warning)' : '1px solid var(--border)';

    return (
        <>
            <div
                className="card note-card-grid h-100"
                style={{ 
                    cursor: 'pointer', 
                    border: pinnedBorder, 
                    borderLeft: borderLeftColor ? `4px solid ${borderLeftColor}` : pinnedBorder,
                    borderRadius: 'var(--radius-md)', 
                    background: noteColor 
                }}
                onClick={() => onOpen(note)}
            >
                {/* Thumbnail image */}
                {note.images?.[0] && (
                    <img src={note.images[0]} alt="" className="card-img-top"
                        style={{ height: 130, objectFit: 'cover', borderRadius: 'calc(var(--radius-md) - 1.5px) calc(var(--radius-md) - 1.5px) 0 0' }} />
                )}

                <div className="card-body py-3 px-4 d-flex flex-column gap-2">
                    {/* Icons row + menu */}
                    <div className="d-flex justify-content-between align-items-start">
                        <NoteIcons note={note} />
                        <div className="position-relative" onClick={e => e.stopPropagation()}>
                            <button
                                className="btn btn-sm btn-link text-secondary p-0 note-menu-btn"
                                onClick={() => setMenu(v => !v)}
                                id={`grid-menu-${note.id}`}
                                title="More options"
                            >
                                <MoreVertical size={15} strokeWidth={2} />
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
                        <h6 className="card-title mb-0 fw-bold text-truncate" style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>
                            {note.title}
                        </h6>
                    )}

                    {/* Content preview */}
                    {note.content && (
                        <p className="card-text text-muted small mb-0"
                            style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, fontSize }}>
                            {note.content.slice(0, 200)}
                        </p>
                    )}

                    <div className="mt-auto pt-2">
                        <Labels labels={note.labels} />

                        {/* Timestamp */}
                        <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                            {fmt(note.updated_at)}
                        </p>
                    </div>
                </div>
            </div>

            {del.step === 'unlock' && <NoteUnlockModal note={note} onUnlocked={del.onUnlocked} onCancel={del.onCancel} />}
            <DeleteConfirmDialog open={del.step === 'confirm'} noteTitle={note.title} onConfirm={del.onConfirm} onCancel={del.onCancel} />
        </>
    );
}

export function ListRow({ note, onOpen }) {
    const { pinNote } = useNotes();
    const { user } = useAuth();
    const [menu, setMenu] = useState(false);
    const del = useDeleteFlow(note);

    const prefs = user?.preferences ?? {};
    const isDark = prefs.theme === 'dark';
    const rawColor = note.color || prefs.noteColor || '#ffffff';
    
    const noteColor = isDark ? 'var(--surface)' : adaptColorForTheme(rawColor, false);
    const borderLeftColor = isDark && rawColor !== '#ffffff' ? adaptColorForTheme(rawColor, true) : null;
    
    const fontSizeMap = { small: '0.82rem', medium: '0.9rem', large: '1rem' };
    const fontSize = fontSizeMap[prefs.fontSize] || '0.9rem';

    const pinnedBorder = note.is_pinned ? '1px solid var(--warning)' : '1px solid var(--border)';

    return (
        <>
            <div
                className="note-card-list d-flex align-items-center gap-3 px-4 py-3 rounded-3 mb-3"
                style={{ 
                    cursor: 'pointer', 
                    border: pinnedBorder, 
                    borderLeft: borderLeftColor ? `4px solid ${borderLeftColor}` : pinnedBorder,
                    position: 'relative', zIndex: menu ? 10 : 1, background: noteColor 
                }}
                onClick={() => onOpen(note)}
            >
                {/* Thumbnail */}
                {note.images?.[0] && (
                    <img src={note.images[0]} alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}
                {/* Info */}
                <div className="flex-grow-1 overflow-hidden d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>
                            {note.title || <span className="text-muted">Untitled</span>}
                        </h6>
                        <NoteIcons note={note} />
                    </div>
                    {note.content && (
                        <span className="text-muted small text-truncate d-block" style={{ lineHeight: 1.6, fontSize }}>
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
                            className="btn btn-sm btn-link text-secondary p-0 note-menu-btn"
                            onClick={() => setMenu(v => !v)}
                            id={`list-menu-${note.id}`}
                            title="More options"
                        >
                            <MoreVertical size={15} strokeWidth={2} />
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
