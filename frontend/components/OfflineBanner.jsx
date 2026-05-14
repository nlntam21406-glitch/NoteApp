import { useNotes } from '../context/NoteContext';

export default function OfflineBanner() {
    const { isOnline } = useNotes();
    if (isOnline) return null;
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '7px 20px',
                background: '#1f2937',
                color: '#f9fafb',
                fontSize: '0.82rem',
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 1049,
                fontFamily: 'var(--font-base)',
                letterSpacing: '0.01em',
            }}
        >
            <span style={{ fontSize: '1rem' }}>📴</span>
            You're offline — changes will sync when connection is restored.
        </div>
    );
}
