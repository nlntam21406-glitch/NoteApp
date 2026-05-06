// src/pages/HomePage.jsx — main layout (grid/list, sidebar, search, editor)
import { useState, useCallback, useEffect } from 'react';
import { Link }           from 'react-router-dom';
import { useAuth }        from '../context/AuthContext';
import { NoteProvider, useNotes } from '../context/NoteContext';
import { GridCard, ListRow } from '../components/NoteCard';
import NoteEditor           from '../components/NoteEditor';
import SearchBar            from '../components/SearchBar';
import LabelManager         from '../components/LabelManager';
import OfflineBanner        from '../components/OfflineBanner';
import ShareManager         from '../components/ShareManager';

function HomeInner() {
    const { user, logout }  = useAuth();
    const { notes, loading, viewMode, toggleView, addNote } = useNotes();
    const [activeNote,   setActiveNote]   = useState(null);
    const [shareNote,    setShareNote]    = useState(null);
    const [sidebarOpen,  setSidebar]      = useState(false);
    const [isMobile,     setIsMobile]     = useState(() => window.innerWidth < 768);

    // Reactively update isMobile on window resize
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const openNote = useCallback(n => setActiveNote(n), []);

    const handleNew = useCallback(async () => {
        const note = await addNote();
        setActiveNote(note);
    }, [addNote]);

    const pinned = notes.filter(n => n.is_pinned);
    const others = notes.filter(n => !n.is_pinned);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
    };

    // find current note from latest state (reflects auto-saves)
    const currentNote = activeNote ? notes.find(n => n.id === activeNote.id) ?? activeNote : null;

    return (
        <div className="d-flex flex-column bg-body" style={{ minHeight: '100vh' }}>
            <OfflineBanner />

            {/* Navbar */}
            <nav className="navbar bg-body border-bottom sticky-top px-3 py-2" style={{ zIndex: 1040 }}>
                <button className="btn btn-sm btn-outline-secondary me-2 d-md-none" onClick={() => setSidebar(v => !v)}>☰</button>
                <span className="navbar-brand fw-bold mb-0" style={{ color: '#4f46e5' }}>📝 NoteApp</span>
                <div className="flex-grow-1 mx-3 d-none d-sm-block"><SearchBar/></div>

                {/* View toggle */}
                <div className="btn-group me-2">
                    <button className={`btn btn-sm ${viewMode==='grid'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>viewMode!=='grid'&&toggleView()} title="Grid view">▦</button>
                    <button className={`btn btn-sm ${viewMode==='list'?'btn-primary':'btn-outline-secondary'}`} onClick={()=>viewMode!=='list'&&toggleView()} title="List view">☰</button>
                </div>

                {/* Shared with me link */}
                <Link to="/shared-with-me" className="btn btn-sm btn-outline-secondary me-2" title="Notes shared with me">🔗</Link>

                {/* User menu */}
                <div className="dropdown">
                    <button
                        className="avatar-btn dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        {user?.avatar_url
                            ? <img src={user.avatar_url} alt="avatar"/>
                            : <span style={{fontSize:'0.85rem',fontWeight:'bold',color:'#4b5563',lineHeight:1}}>{user?.display_name?.charAt(0).toUpperCase()}</span>
                        }
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><span className="dropdown-item-text small text-muted">{user?.email}</span></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><Link className="dropdown-item small" to="/preferences">⚙️ Preferences</Link></li>
                        <li><button className="dropdown-item small text-danger" onClick={logout}>Sign out</button></li>
                    </ul>
                </div>
            </nav>

            {/* Mobile search */}
            <div className="d-sm-none px-3 py-2 bg-white border-bottom"><SearchBar/></div>

            <div className="d-flex flex-grow-1" style={{ overflow: 'hidden', position: 'relative' }}>
                {/* Sidebar overlay backdrop (mobile only) */}
                {isMobile && sidebarOpen && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100"
                        style={{ background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
                        onClick={() => setSidebar(false)}
                    />
                )}

                {/* Sidebar — fixed overlay on mobile, sticky in layout on desktop */}
                {isMobile ? (
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{
                            position: 'fixed', top: 0, left: 0,
                            width: 240, height: '100vh', zIndex: 201,
                            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                            transition: 'transform 0.25s ease',
                        }}
                    >
                        <LabelManager/>
                    </aside>
                ) : (
                    <aside
                        className="bg-body border-end p-3 overflow-auto"
                        style={{ width: 220, flexShrink: 0, position: 'sticky', top: 56, height: 'calc(100vh - 56px)' }}
                    >
                        <LabelManager/>
                    </aside>
                )}

                {/* Main */}
                <main className="flex-grow-1 p-3 p-md-4 overflow-auto">
                    <button className="btn btn-primary mb-4 d-flex align-items-center gap-2" onClick={handleNew} style={{ borderRadius: 24 }}>
                        <span style={{ fontSize: '1.1rem' }}>+</span> New note
                    </button>

                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
                            <h5 className="fw-semibold">No notes yet</h5>
                            <p className="small">Create your first note to get started.</p>
                            <button className="btn btn-primary btn-sm" onClick={handleNew}>+ Create note</button>
                        </div>
                    ) : (
                        <>
                            {pinned.length > 0 && (
                                <section className="mb-4">
                                    <p className="text-muted small fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.72rem' }}>📌 Pinned</p>
                                    {viewMode === 'grid'
                                        ? <div style={gridStyle}>{pinned.map(n => <GridCard key={n.id} note={n} onOpen={openNote}/>)}</div>
                                        : <div>{pinned.map(n => <ListRow key={n.id} note={n} onOpen={openNote}/>)}</div>}
                                </section>
                            )}
                            {others.length > 0 && (
                                <section>
                                    {pinned.length > 0 && <p className="text-muted small fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.72rem' }}>Other notes</p>}
                                    {viewMode === 'grid'
                                        ? <div style={gridStyle}>{others.map(n => <GridCard key={n.id} note={n} onOpen={openNote}/>)}</div>
                                        : <div>{others.map(n => <ListRow key={n.id} note={n} onOpen={openNote}/>)}</div>}
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

            {/* Share manager modal */}
            {shareNote && <ShareManager note={shareNote} onClose={() => setShareNote(null)}/>}
        </div>
    );
}

export default function HomePage() {
    return <NoteProvider><HomeInner/></NoteProvider>;
}
