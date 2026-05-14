import { useState } from 'react';
import { useNotes } from '../context/NoteContext';

export default function LabelManager({ onSelect }) {
    const { labels, createLabel, renameLabel, removeLabel, filterLabel, filterByLabel } = useNotes();
    const [newName, setNew] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');

    const submit = async e => {
        e.preventDefault();
        if (!newName.trim()) return;
        await createLabel(newName.trim());
        setNew('');
    };

    const saveRename = async id => {
        if (!editName.trim()) return;
        await renameLabel(id, editName.trim());
        setEditId(null);
    };

    const handleSelect = (id) => {
        filterByLabel(id);
        onSelect?.();
    };

    return (
        <div>
            {/* Section header */}
            <p style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-subtle)',
                padding: '0 8px',
                marginBottom: 6
            }}>
                Labels
            </p>

            {/* All Notes button */}
            <button
                id="label-filter-all"
                onClick={() => handleSelect(null)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '7px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: filterLabel === null ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    marginBottom: 2,
                    background: filterLabel === null ? 'var(--primary-light)' : 'transparent',
                    color: filterLabel === null ? 'var(--primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-base)',
                }}
            >
                <span style={{ fontSize: '0.9rem' }}>🗒️</span> All notes
            </button>

            {/* Label list */}
            {labels.map(l => (
                <div key={l.id} className="d-flex align-items-center gap-1 mb-1">
                    {editId === l.id ? (
                        <>
                            <input
                                className="form-control form-control-sm"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') saveRename(l.id);
                                    if (e.key === 'Escape') setEditId(null);
                                }}
                                autoFocus
                                style={{ fontSize: '0.82rem', height: 30 }}
                            />
                            <button
                                className="btn btn-sm btn-success px-2 py-0"
                                style={{ height: 30, fontSize: '0.8rem' }}
                                onClick={() => saveRename(l.id)}
                                title="Save"
                            >✓</button>
                            <button
                                className="btn btn-sm btn-outline-secondary px-2 py-0"
                                style={{ height: 30, fontSize: '0.8rem' }}
                                onClick={() => setEditId(null)}
                                title="Cancel"
                            >✕</button>
                        </>
                    ) : (
                        <>
                            <button
                                id={`label-filter-${l.id}`}
                                onClick={() => handleSelect(l.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexGrow: 1,
                                    padding: '7px 10px',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.875rem',
                                    fontWeight: filterLabel === l.id ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    background: filterLabel === l.id ? 'var(--primary-light)' : 'transparent',
                                    color: filterLabel === l.id ? 'var(--primary)' : 'var(--text-muted)',
                                    fontFamily: 'var(--font-base)',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontSize: '0.9rem' }}>🏷️</span>
                                <span className="text-truncate" style={{ maxWidth: 110 }}>{l.name}</span>
                                {l.notes_count != null && (
                                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.6 }}>
                                        {l.notes_count}
                                    </span>
                                )}
                            </button>

                            {/* Rename */}
                            <button
                                className="btn btn-sm btn-link p-0"
                                title="Rename label"
                                style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', opacity: 0.7 }}
                                onClick={() => { setEditId(l.id); setEditName(l.name); }}
                            >✏️</button>

                            {/* Delete */}
                            <button
                                className="btn btn-sm btn-link p-0"
                                title="Delete label"
                                style={{ fontSize: '0.78rem', color: 'var(--danger)', opacity: 0.7 }}
                                onClick={() => removeLabel(l.id)}
                            >✕</button>
                        </>
                    )}
                </div>
            ))}

            {/* Add new label form */}
            <form onSubmit={submit} className="d-flex gap-1 mt-3">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="New label…"
                    value={newName}
                    onChange={e => setNew(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                />
                <button
                    type="submit"
                    className="btn btn-sm btn-outline-primary px-2"
                    title="Add label"
                    style={{ flexShrink: 0 }}
                >+</button>
            </form>
        </div>
    );
}
