// src/pages/HomePage.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { NoteProvider, useNotes } from '../context/NoteContext';

import { GridCard, ListRow } from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import SearchBar from '../components/SearchBar';
import LabelManager from '../components/LabelManager';
import OfflineBanner from '../components/OfflineBanner';
import ShareManager from '../components/ShareManager';

function HomeInner() {
    const { user, logout } = useAuth();
    const { notes, loading, viewMode, toggleView, addNote } = useNotes();

    const [activeNote,  setActiveNote]  = useState(null);
    const [shareNote,   setShareNote]   = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef(null);

    useEffect(() => {
        const measure = () => headerRef.current && setHeaderHeight(headerRef.current.offsetHeight);
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => { if (!isMobile) setSidebarOpen(false); }, [isMobile]);

    const openNote  = useCallback(note => setActiveNote(note), []);
    const handleNew = useCallback(async () => { const note = await addNote(); setActiveNote(note); }, [addNote]);

    const pinnedNotes = notes.filter(n => n.is_pinned);
    const otherNotes  = notes.filter(n => !n.is_pinned);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
    };

    const currentNote = activeNote ? notes.find(n => n.id === activeNote.id) ?? activeNote : null;

    /* ── Section label style ── */
    const sectionLabel = {
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-subtle)',
        marginBottom: 10,
    };

    /* ── Active view toggle button style ── */
    const viewBtn = (active) => ({
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 10px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'var(--transition)',
        background: active ? 'var(--primary)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        fontFamily: 'var(--font-base)',
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Offline banner */}
            <OfflineBanner />

            {/* ── HEADER ── */}
            <div ref={headerRef}>
                <nav
                    className="navbar bg-body border-bottom"
                    style={{ zIndex: 1040, padding: '10px 16px' }}
                >
                    {/* Mobile sidebar toggle */}
                    <button
                        className="btn btn-sm btn-outline-secondary me-2 d-md-none"
                        onClick={() => setSidebarOpen(v => !v)}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        id="sidebar-toggle"
                    >
                        ☰
                    </button>

                    {/* Logo */}
                    <span className="navbar-brand fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                        📝 NoteApp
                    </span>

                    {/* Desktop search */}
                    <div className="flex-grow-1 mx-3 d-none d-sm-flex justify-content-center">
                        <SearchBar />
                    </div>

                    {/* View toggle */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 2,
                            background: 'var(--surface-2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: 3,
                            marginRight: 8,
                        }}
                    >
                        <button
                            style={viewBtn(viewMode === 'grid')}
                            onClick={() => viewMode !== 'grid' && toggleView()}
                            title="Grid view"
                            id="view-grid"
                        >▦</button>
                        <button
                            style={viewBtn(viewMode === 'list')}
                            onClick={() => viewMode !== 'list' && toggleView()}
                            title="List view"
                            id="view-list"
                        >☰</button>
                    </div>

                    {/* Shared notes link */}
                    <Link
                        to="/shared-with-me"
                        className="btn btn-sm btn-outline-secondary me-2"
                        title="Notes shared with me"
                        style={{ borderRadius: 'var(--radius-sm)' }}
                        id="shared-with-me-link"
                    >
                        🔗
                    </Link>

                    {/* User dropdown */}
                    <div className="dropdown">
                        <button
                            className="avatar-btn dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            id="user-menu-btn"
                        >
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="avatar" />
                            ) : (
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                                    {user?.display_name?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <span className="dropdown-item-text small" style={{ color: 'var(--text-subtle)', padding: '6px 12px', display: 'block' }}>
                                    {user?.email}
                                </span>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <Link className="dropdown-item small" to="/preferences" id="preferences-link">
                                    ⚙️ Preferences
                                </Link>
                            </li>
                            <li>
                                <button className="dropdown-item small text-danger" onClick={logout} id="logout-btn">
                                    Sign out
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Mobile search bar */}
                <div className="d-sm-none px-3 py-2 bg-white border-bottom">
                    <SearchBar />
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>

                {/* Mobile backdrop */}
                {isMobile && sidebarOpen && (
                    <div
                        style={{
                            position: 'fixed', top: headerHeight, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.45)', zIndex: 1050,
                        }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ── SIDEBAR ── */}
                {isMobile ? (
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{
                            position: 'fixed', top: headerHeight, left: 0, width: 240, bottom: 0,
                            zIndex: 1051,
                            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                        }}
                    >
                        <LabelManager onSelect={() => setSidebarOpen(false)} />
                    </aside>
                ) : (
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{ width: 220, flexShrink: 0, position: 'sticky', top: 56, height: 'calc(100vh - 56px)' }}
                    >
                        <LabelManager />
                    </aside>
                )}

                {/* ── MAIN CONTENT ── */}
                <main style={{ flexGrow: 1, padding: '24px 28px', overflowY: 'auto' }}>

                    {/* New note button */}
                    <button
                        className="btn btn-primary"
                        onClick={handleNew}
                        id="new-note-btn"
                        style={{
                            borderRadius: 'var(--radius-xl)',
                            padding: '10px 22px',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                        }}
                    >
                        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New note
                    </button>

                    {/* Loading */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div className="spinner-border text-primary" />
                        </div>

                    ) : notes.length === 0 ? (
                        /* Empty state */
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>📝</div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No notes yet</h2>
                            <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>Create your first note to get started.</p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleNew}
                                style={{ borderRadius: 'var(--radius-xl)', padding: '8px 20px' }}
                            >
                                + Create note
                            </button>
                        </div>

                    ) : (
                        <>
                            {/* Pinned notes */}
                            {pinnedNotes.length > 0 && (
                                <section style={{ marginBottom: 28 }}>
                                    <p style={sectionLabel}>📌 Pinned</p>
                                    {viewMode === 'grid' ? (
                                        <div style={gridStyle}>
                                            {pinnedNotes.map(note => <GridCard key={note.id} note={note} onOpen={openNote} />)}
                                        </div>
                                    ) : (
                                        <div>
                                            {pinnedNotes.map(note => <ListRow key={note.id} note={note} onOpen={openNote} />)}
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Other notes */}
                            {otherNotes.length > 0 && (
                                <section>
                                    {pinnedNotes.length > 0 && <p style={sectionLabel}>Other notes</p>}
                                    {viewMode === 'grid' ? (
                                        <div style={gridStyle}>
                                            {otherNotes.map(note => <GridCard key={note.id} note={note} onOpen={openNote} />)}
                                        </div>
                                    ) : (
                                        <div>
                                            {otherNotes.map(note => <ListRow key={note.id} note={note} onOpen={openNote} />)}
                                        </div>
                                    )}
                                </section>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Note editor modal */}
            {currentNote && (
                <NoteEditor note={currentNote} onClose={() => setActiveNote(null)} onShare={() => setShareNote(currentNote)} />
            )}

            {/* Share modal */}
            {shareNote && (
                <ShareManager note={shareNote} onClose={() => setShareNote(null)} />
            )}
        </div>
    );
}

export default function HomePage() {
    return (
        <NoteProvider>
            <HomeInner />
        </NoteProvider>
    );
}