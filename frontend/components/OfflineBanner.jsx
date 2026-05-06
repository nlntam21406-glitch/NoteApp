import { useNotes } from '../context/NoteContext';
export default function OfflineBanner() {
    const { isOnline } = useNotes();
    if (isOnline) return null;
    return (
        <div className="d-flex align-items-center justify-content-center px-4 py-1 small fw-semibold"
            style={{ background:'#374151',color:'#f9fafb',position:'sticky',top:0,zIndex:1049 }}>
            📴 You're offline — changes will sync when connection is restored.
        </div>
    );
}
