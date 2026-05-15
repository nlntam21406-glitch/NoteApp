// src/pages/HomePage.jsx

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu, NotebookPen, LayoutGrid, LayoutList,
    Share2, Settings, LogOut, Pin, Plus,
    FileText,
} from 'lucide-react';

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
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

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
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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
        display: 'flex',
        alignItems: 'center',
        gap: 5,
    };

    /* ── Active view toggle button style ── */
    const viewBtn = (active) => ({
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
                    {/* Sidebar toggle — visible on ALL screen sizes */}
                    <button
                        className="btn btn-sm btn-outline-secondary me-2 nav-icon-btn"
                        onClick={() => setSidebarOpen(v => !v)}
                        style={{ borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, padding: 0 }}
                        id="sidebar-toggle"
                    >
                        <Menu size={16} />
                    </button>

                    {/* Logo */}
                    <span className="navbar-brand fw-bold mb-0" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <NotebookPen size={20} strokeWidth={2.2} style={{ color: 'var(--primary)' }} />
                        NoteApp
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
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            style={viewBtn(viewMode === 'list')}
                            onClick={() => viewMode !== 'list' && toggleView()}
                            title="List view"
                            id="view-list"
                        >
                            <LayoutList size={15} />
                        </button>
                    </div>

                    {/* Shared notes link */}
                    <Link
                        to="/shared-with-me"
                        className="btn btn-sm btn-outline-secondary me-2 nav-icon-btn"
                        title="Notes shared with me"
                        style={{ borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, padding: 0 }}
                        id="shared-with-me-link"
                    >
                        <Share2 size={15} />
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
                                <span className="dropdown-item-text small fw-semibold" style={{ color: 'var(--text)', padding: '6px 12px', display: 'block' }}>
                                    {user?.display_name || user?.email}
                                </span>
                            </li>
                            <li>
                                <span className="dropdown-item-text small" style={{ color: 'var(--text-subtle)', padding: '2px 12px 6px', display: 'block', fontSize: '0.78rem' }}>
                                    {user?.email}
                                </span>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <Link className="dropdown-item small d-flex align-items-center gap-2" to="/preferences" id="preferences-link">
                                    <Settings size={14} strokeWidth={2} />
                                    Preferences
                                </Link>
                            </li>
                            <li>
                                <button className="dropdown-item small text-danger d-flex align-items-center gap-2" onClick={logout} id="logout-btn">
                                    <LogOut size={14} strokeWidth={2} />
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

                {/* ── SIDEBAR ── works on both mobile and desktop ── */}
                {isMobile ? (
                    /* Mobile: slide-in drawer */
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{
                            position: 'fixed', top: headerHeight, left: 0, width: 220, bottom: 0,
                            zIndex: 1051,
                            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                        }}
                    >
                        <LabelManager onSelect={() => setSidebarOpen(false)} />
                    </aside>
                ) : (
                    /* Desktop: collapsible sidebar */
                    <aside
                        className="bg-body border-end overflow-auto"
                        style={{
                            width: sidebarOpen ? 220 : 0,
                            minWidth: sidebarOpen ? 220 : 0,
                            flexShrink: 0,
                            position: 'sticky',
                            top: headerHeight,
                            height: `calc(100vh - ${headerHeight}px)`,
                            overflow: 'hidden',
                            transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
                        }}
                    >
                        <div style={{ padding: '12px 12px', width: 220 }}>
                            <LabelManager />
                        </div>
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
                            gap: 7,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                        }}
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        New note
                    </button>

                    {/* Loading */}
                    {loading ? (
                        <div style={{ padding: '0 0' }}>
                            <section style={{ marginBottom: 28 }}>
                                <p className="skeleton-box" style={{...sectionLabel, width: 80, height: 16, marginBottom: 16, borderRadius: 4}} />
                                <div style={gridStyle}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="skeleton-card">
                                            <div className="skeleton-box" style={{ width: '70%', height: 20 }} />
                                            <div className="skeleton-box" style={{ width: '100%', height: 12, marginTop: 8 }} />
                                            <div className="skeleton-box" style={{ width: '90%', height: 12 }} />
                                            <div className="skeleton-box" style={{ width: '40%', height: 12 }} />
                                            <div className="skeleton-box" style={{ width: 60, height: 20, marginTop: 'auto', borderRadius: 99 }} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                    ) : notes.length === 0 ? (
                        /* Empty state */
                        <div className="empty-state-container">
                            <div className="empty-state-icon-wrap">
                                <FileText size={48} strokeWidth={1.5} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>No notes yet</h2>
                            <p style={{ fontSize: '0.9rem', marginBottom: 20, color: 'var(--text-muted)' }}>Create your first note to get started.</p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleNew}
                                style={{ borderRadius: 'var(--radius-xl)', padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                                Create note
                            </button>
                        </div>

                    ) : (
                        <>
                            {/* Pinned notes */}
                            {pinnedNotes.length > 0 && (
                                <section style={{ marginBottom: 28 }}>
                                    <p style={sectionLabel}>
                                        <Pin size={11} strokeWidth={2.5} />
                                        Pinned
                                    </p>
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