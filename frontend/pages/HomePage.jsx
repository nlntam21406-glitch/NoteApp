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

    // Authentication context
    const { user, logout } = useAuth();

    // Notes context
    const {
        notes,
        loading,
        viewMode,
        toggleView,
        addNote
    } = useNotes();

    // Local states
    const [activeNote, setActiveNote] = useState(null);
    const [shareNote, setShareNote] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Detect mobile screen
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth < 768
    );

    // Store dynamic header height
    const [headerHeight, setHeaderHeight] = useState(0);

    // Reference for measuring header height
    const headerRef = useRef(null);

    // Measure header height dynamically
    // This includes navbar + mobile search bar
    useEffect(() => {

        const measureHeader = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight);
            }
        };

        measureHeader();

        window.addEventListener('resize', measureHeader);

        return () => {
            window.removeEventListener('resize', measureHeader);
        };

    }, []);

    // Detect screen resize for mobile mode
    useEffect(() => {

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };

    }, []);

    // Auto close sidebar when switching to desktop
    useEffect(() => {

        if (!isMobile) {
            setSidebarOpen(false);
        }

    }, [isMobile]);

    // Open note editor
    const openNote = useCallback((note) => {
        setActiveNote(note);
    }, []);

    // Create new note
    const handleNew = useCallback(async () => {

        const note = await addNote();

        setActiveNote(note);

    }, [addNote]);

    // Separate pinned notes
    const pinnedNotes = notes.filter(note => note.is_pinned);

    // Separate normal notes
    const otherNotes = notes.filter(note => !note.is_pinned);

    // Grid layout style
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
    };

    // Find latest active note
    const currentNote = activeNote
        ? notes.find(n => n.id === activeNote.id) ?? activeNote
        : null;

    return (

        <div
            className="d-flex flex-column bg-body"
            style={{ minHeight: '100vh' }}
        >

            {/* Offline notification */}
            <OfflineBanner />

            {/* =======================================================
                HEADER AREA
                Navbar + mobile search bar
            ======================================================== */}

            <div ref={headerRef}>

                {/* Navbar */}
                <nav
                    className="navbar bg-body border-bottom sticky-top px-3 py-2"
                    style={{ zIndex: 1040 }}
                >

                    {/* Mobile sidebar toggle */}
                    <button
                        className="btn btn-sm btn-outline-secondary me-2 d-md-none"
                        onClick={() => setSidebarOpen(v => !v)}
                    >
                        ☰
                    </button>

                    {/* App logo / title */}
                    <span
                        className="navbar-brand fw-bold mb-0"
                        style={{ color: '#4f46e5' }}npm run build
                    >
                        📝 NoteApp
                    </span>

                    {/* Desktop search bar */}
                    <div className="flex-grow-1 mx-3 d-none d-sm-block">
                        <SearchBar />
                    </div>

                    {/* View mode buttons */}
                    <div className="btn-group me-2">

                        {/* Grid view */}
                        <button
                            className={`btn btn-sm ${
                                viewMode === 'grid'
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                            }`}
                            onClick={() => {
                                if (viewMode !== 'grid') {
                                    toggleView();
                                }
                            }}
                            title="Grid view"
                        >
                            ▦
                        </button>

                        {/* List view */}
                        <button
                            className={`btn btn-sm ${
                                viewMode === 'list'
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                            }`}
                            onClick={() => {
                                if (viewMode !== 'list') {
                                    toggleView();
                                }
                            }}
                            title="List view"
                        >
                            ☰
                        </button>

                    </div>

                    {/* Shared notes page */}
                    <Link
                        to="/shared-with-me"
                        className="btn btn-sm btn-outline-secondary me-2"
                        title="Notes shared with me"
                    >
                        🔗
                    </Link>

                    {/* User dropdown */}
                    <div className="dropdown">

                        <button
                            className="avatar-btn dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >

                            {/* User avatar */}
                            {user?.avatar_url ? (

                                <img
                                    src={user.avatar_url}
                                    alt="avatar"
                                />

                            ) : (

                                <span
                                    style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        color: '#4b5563',
                                        lineHeight: 1
                                    }}
                                >
                                    {user?.display_name
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </span>

                            )}

                        </button>

                        {/* Dropdown menu */}
                        <ul className="dropdown-menu dropdown-menu-end shadow-sm">

                            <li>
                                <span className="dropdown-item-text small text-muted">
                                    {user?.email}
                                </span>
                            </li>

                            <li>
                                <hr className="dropdown-divider" />
                            </li>

                            <li>
                                <Link
                                    className="dropdown-item small"
                                    to="/preferences"
                                >
                                    ⚙️ Preferences
                                </Link>
                            </li>

                            <li>
                                <button
                                    className="dropdown-item small text-danger"
                                    onClick={logout}
                                >
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

            {/* =======================================================
                MAIN CONTENT AREA
            ======================================================== */}

            <div
                className="d-flex flex-grow-1"
                style={{
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >

                {/* ===================================================
                    MOBILE BACKDROP
                ==================================================== */}

                {isMobile && sidebarOpen && (

                    <div
                        style={{
                            position: 'fixed',
                            top: headerHeight,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.4)',
                            zIndex: 1050,
                        }}
                        onClick={() => setSidebarOpen(false)}
                    />

                )}

                {/* ===================================================
                    SIDEBAR
                ==================================================== */}

                {isMobile ? (

                    // Mobile sidebar
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{
                            position: 'fixed',
                            top: headerHeight,
                            left: 0,
                            width: 240,
                            bottom: 0,
                            zIndex: 1051,
                            transform: sidebarOpen
                                ? 'translateX(0)'
                                : 'translateX(-100%)',
                            transition: 'transform 0.25s ease',
                        }}
                    >

                        <LabelManager
                            onSelect={() => setSidebarOpen(false)}
                        />

                    </aside>

                ) : (

                    // Desktop sidebar
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{
                            width: 220,
                            flexShrink: 0,
                            position: 'sticky',
                            top: 56,
                            height: 'calc(100vh - 56px)'
                        }}
                    >

                        <LabelManager />

                    </aside>

                )}

                {/* ===================================================
                    MAIN PAGE CONTENT
                ==================================================== */}

                <main className="flex-grow-1 p-3 p-md-4 overflow-auto">

                    {/* Create new note button */}
                    <button
                        className="btn btn-primary mb-4 d-flex align-items-center gap-2"
                        onClick={handleNew}
                        style={{ borderRadius: 24 }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>+</span>
                        New note
                    </button>

                    {/* Loading state */}
                    {loading ? (

                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" />
                        </div>

                    ) : notes.length === 0 ? (

                        // Empty state
                        <div className="text-center py-5 text-muted">

                            <div
                                style={{
                                    fontSize: 56,
                                    marginBottom: 16
                                }}
                            >
                                📝
                            </div>

                            <h5 className="fw-semibold">
                                No notes yet
                            </h5>

                            <p className="small">
                                Create your first note to get started.
                            </p>

                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleNew}
                            >
                                + Create note
                            </button>

                        </div>

                    ) : (

                        <>
                            {/* Pinned notes */}
                            {pinnedNotes.length > 0 && (

                                <section className="mb-4">

                                    <p
                                        className="text-muted small fw-semibold mb-2 text-uppercase"
                                        style={{
                                            letterSpacing: '0.05em',
                                            fontSize: '0.72rem'
                                        }}
                                    >
                                        📌 Pinned
                                    </p>

                                    {viewMode === 'grid' ? (

                                        <div style={gridStyle}>
                                            {pinnedNotes.map(note => (
                                                <GridCard
                                                    key={note.id}
                                                    note={note}
                                                    onOpen={openNote}
                                                />
                                            ))}
                                        </div>

                                    ) : (

                                        <div>
                                            {pinnedNotes.map(note => (
                                                <ListRow
                                                    key={note.id}
                                                    note={note}
                                                    onOpen={openNote}
                                                />
                                            ))}
                                        </div>

                                    )}

                                </section>

                            )}

                            {/* Other notes */}
                            {otherNotes.length > 0 && (

                                <section>

                                    {pinnedNotes.length > 0 && (
                                        <p
                                            className="text-muted small fw-semibold mb-2 text-uppercase"
                                            style={{
                                                letterSpacing: '0.05em',
                                                fontSize: '0.72rem'
                                            }}
                                        >
                                            Other notes
                                        </p>
                                    )}

                                    {viewMode === 'grid' ? (

                                        <div style={gridStyle}>
                                            {otherNotes.map(note => (
                                                <GridCard
                                                    key={note.id}
                                                    note={note}
                                                    onOpen={openNote}
                                                />
                                            ))}
                                        </div>

                                    ) : (

                                        <div>
                                            {otherNotes.map(note => (
                                                <ListRow
                                                    key={note.id}
                                                    note={note}
                                                    onOpen={openNote}
                                                />
                                            ))}
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

                <NoteEditor
                    note={currentNote}
                    onClose={() => setActiveNote(null)}
                    onShare={() => setShareNote(currentNote)}
                />

            )}

            {/* Share modal */}
            {shareNote && (

                <ShareManager
                    note={shareNote}
                    onClose={() => setShareNote(null)}
                />

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