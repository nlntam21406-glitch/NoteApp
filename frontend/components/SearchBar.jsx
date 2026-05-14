import { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';

export default function SearchBar() {
    const { search, searchQuery } = useNotes();
    const [val, setVal] = useState(searchQuery);
    const [focused, setFocused] = useState(false);
    const timer = useRef(null);

    const onChange = e => {
        const q = e.target.value;
        setVal(q);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => search(q), 300);
    };

    const clear = () => {
        setVal('');
        clearTimeout(timer.current);
        search('');
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    return (
        <div
            style={{
                maxWidth: 420,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface-2)',
                border: `1.5px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
                borderRadius: 99,
                padding: '0 14px',
                gap: 8,
                transition: 'var(--transition)',
                boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
            }}
        >
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.9rem', flexShrink: 0 }}>🔍</span>
            <input
                id="search-notes-input"
                type="search"
                placeholder="Search notes…"
                value={val}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '0.875rem',
                    padding: '8px 0',
                    fontFamily: 'var(--font-base)',
                }}
            />
            {val && (
                <button
                    onClick={clear}
                    type="button"
                    style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--text-subtle)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                        fontSize: '0.8rem',
                        flexShrink: 0,
                        transition: 'var(--transition)',
                    }}
                >✕</button>
            )}
        </div>
    );
}
