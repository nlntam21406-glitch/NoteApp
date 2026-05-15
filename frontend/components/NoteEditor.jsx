// src/components/NoteEditor.jsx — shared create/edit modal, NO save button, auto-save 500ms
import { useRef, useCallback, useState } from 'react';
import { Pin, Share2, Lock, Unlock, Tag, Image, Eye } from 'lucide-react';
import { useNotes }         from '../context/NoteContext';
import { useAutoSave }      from '../hooks/useAutoSave';
import { useCollaboration } from '../hooks/useCollaboration';
import { unlockTokenStore } from '../utils/unlockTokenStore';
import NoteUnlockModal      from './NoteUnlockModal';
import NoteLockManager      from './NoteLockManager';
import { NoteIcons }        from './NoteCard';

/* ── LabelPicker inline ── */
function LabelPicker({ note }) {
    const { labels, syncNoteLabels } = useNotes();
    const [open, setOpen] = useState(false);
    const attached = new Set((note.labels || []).map(l => l.id));

    const toggle = async id => {
        const next = new Set(attached);
        next.has(id) ? next.delete(id) : next.add(id);
        await syncNoteLabels(note.id, [...next]);
    };

    if (!labels.length) return null;
    return (
        <div className="position-relative d-inline-block">
            <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}
                onClick={() => setOpen(v => !v)}
                id="label-picker-btn"
            >
                <Tag size={13} strokeWidth={2} />
                Labels
            </button>
            {open && (
                <>
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 10 }} onClick={() => setOpen(false)} />
                    <div
                        className="position-absolute border rounded shadow-sm p-2"
                        style={{
                            zIndex: 11, bottom: '100%', left: 0,
                            minWidth: 170, marginBottom: 6,
                            background: 'var(--surface)',
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        {labels.map(l => (
                            <div key={l.id} className="form-check mb-1" style={{ fontSize: '0.85rem' }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`lbl-${l.id}`}
                                    checked={attached.has(l.id)}
                                    onChange={() => toggle(l.id)}
                                />
                                <label className="form-check-label" htmlFor={`lbl-${l.id}`}
                                    style={{ color: 'var(--text)', cursor: 'pointer' }}>
                                    {l.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function NoteEditor({ note, onClose, onShare, isShared = false, sharePermission = null }) {
    const { addImages, delImage, pinNote } = useNotes();
    const gated = note.is_locked && !unlockTokenStore.isUnlocked(note.id);
    const [showGate,    setShowGate]  = useState(gated);
    const [showLockMgr, setLockMgr]  = useState(false);
    const [, setCollabs]              = useState([]);

    const { title, setTitle, content, setContent, saving, saved } = useAutoSave(note);
    const fileRef = useRef();

    /* Real-time collaboration */
    const canCollab = !isShared || sharePermission === 'edit';
    useCollaboration(note.id, canCollab, payload => {
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
    if (showGate) return <NoteUnlockModal note={note} onUnlocked={() => setShowGate(false)} onCancel={onClose} />;

    const readOnly = isShared && sharePermission === 'read';

    /* Auto-save indicator */
    const saveColor = saving ? 'var(--warning)' : saved ? 'var(--success)' : 'transparent';
    const saveText  = saving ? '● Saving…' : saved ? '✓ Saved' : '·';

    return (
        <>
            <div
                className="modal d-block"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1055 }}
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <div
                    className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-content" style={{ minHeight: 440 }}>

                        {/* Header */}
                        <div className="modal-header py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                            <div className="d-flex align-items-center gap-2 w-100">
                                {!isShared && (
                                    <>
                                        {/* Pin button */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center gap-1 ${note.is_pinned ? 'btn-warning' : 'btn-outline-secondary'}`}
                                            title={note.is_pinned ? 'Unpin' : 'Pin'}
                                            onClick={() => pinNote(note.id)}
                                            id="pin-note-btn"
                                            style={{ borderRadius: 'var(--radius-sm)' }}
                                        >
                                            <Pin size={14} strokeWidth={2} />
                                        </button>

                                        {/* Share button */}
                                        {onShare && (
                                            <button
                                                className={`btn btn-sm d-flex align-items-center gap-1 ${note.is_shared ? 'btn-success' : 'btn-outline-secondary'}`}
                                                title="Share note"
                                                onClick={onShare}
                                                id="share-note-btn"
                                                style={{ borderRadius: 'var(--radius-sm)' }}
                                            >
                                                <Share2 size={14} strokeWidth={2} />
                                            </button>
                                        )}

                                        {/* Lock button */}
                                        <button
                                            className={`btn btn-sm d-flex align-items-center gap-1 ${note.is_locked ? 'btn-danger' : 'btn-outline-secondary'}`}
                                            title={note.is_locked ? 'Manage lock' : 'Lock note'}
                                            onClick={() => setLockMgr(true)}
                                            id="lock-note-btn"
                                            style={{ borderRadius: 'var(--radius-sm)' }}
                                        >
                                            {note.is_locked
                                                ? <Lock size={14} strokeWidth={2} />
                                                : <Unlock size={14} strokeWidth={2} />
                                            }
                                        </button>
                                    </>
                                )}

                                {readOnly && (
                                    <span className="badge d-flex align-items-center gap-1" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 99 }}>
                                        <Eye size={12} strokeWidth={2} />
                                        Read only
                                    </span>
                                )}

                                {/* Auto-save status — NO save button */}
                                <span
                                    className="ms-auto small"
                                    style={{
                                        color: saveColor,
                                        transition: 'color 0.3s',
                                        minWidth: 80,
                                        textAlign: 'right',
                                        fontSize: '0.8rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {saveText}
                                </span>

                                <button
                                    type="button"
                                    className="btn-close ms-2"
                                    onClick={onClose}
                                    id="close-editor-btn"
                                />
                            </div>
                        </div>

                        {/* Body — EXACTLY 2 fields: title + content */}
                        <div className="modal-body pt-0" style={{ background: 'var(--surface)' }}>
                            <input
                                type="text"
                                className="form-control form-control-lg border-0 shadow-none fw-bold px-0"
                                placeholder="Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                style={{
                                    fontSize: '1.4rem',
                                    outline: 'none',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    fontFamily: 'var(--font-base)',
                                    fontWeight: 700,
                                }}
                                readOnly={readOnly}
                            />
                            <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />
                            <textarea
                                className="form-control border-0 shadow-none px-0 w-100"
                                placeholder="Take a note…"
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={12}
                                style={{
                                    resize: 'none',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    color: 'var(--text)',
                                    fontFamily: 'var(--font-base)',
                                    lineHeight: 1.7,
                                }}
                                readOnly={readOnly}
                            />

                            {/* Images */}
                            {note.images?.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {note.images.map(url => (
                                        <div key={url} className="position-relative">
                                            <img
                                                src={url} alt=""
                                                style={{
                                                    width: 100, height: 100,
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1.5px solid var(--border)',
                                                }}
                                            />
                                            {!readOnly && (
                                                <button
                                                    className="btn btn-danger btn-sm position-absolute"
                                                    style={{ top: -6, right: -6, width: 22, height: 22, padding: 0, fontSize: 11, borderRadius: '50%', lineHeight: 1 }}
                                                    onClick={() => handleRemoveImage(url)}
                                                >×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Labels */}
                            {!isShared && <div className="mt-3"><LabelPicker note={note} /></div>}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer py-2" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', justifyContent: 'flex-start' }}>
                            {!readOnly && (
                                <>
                                    <input ref={fileRef} type="file" accept="image/*" multiple className="d-none" onChange={handleImages} />
                                    <button
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                        onClick={() => fileRef.current?.click()}
                                        id="add-image-btn"
                                        style={{ borderRadius: 'var(--radius-sm)' }}
                                    >
                                        <Image size={13} strokeWidth={2} />
                                        Add image
                                    </button>
                                </>
                            )}
                            <div className="ms-auto d-flex gap-2 align-items-center">
                                <NoteIcons note={note} size={12} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showLockMgr && <NoteLockManager note={note} onClose={() => setLockMgr(false)} />}
        </>
    );
}
