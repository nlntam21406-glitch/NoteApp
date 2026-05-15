// src/hooks/useAutoSave.js
import { useState, useEffect, useRef } from 'react';
import { useNotes } from '../context/NoteContext';

export function useAutoSave(note, saveFn = null) {
    const { saveNote } = useNotes();
    const save = saveFn ?? saveNote;
    const [title,   setTitle]   = useState(note?.title   ?? '');
    const [content, setContent] = useState(note?.content ?? '');
    const [saving,  setSaving]  = useState(false);
    const [saved,   setSaved]   = useState(false);
    const timer = useRef(null);
    const mounted = useRef(true);

    // Keep refs in sync so the unmount handler always sees latest values
    const titleRef   = useRef(title);
    const contentRef = useRef(content);
    const noteRef    = useRef(note);
    const saveRef    = useRef(saveNote);
    useEffect(() => { titleRef.current   = title;    }, [title]);
    useEffect(() => { contentRef.current = content;  }, [content]);
    useEffect(() => { noteRef.current    = note;     }, [note]);
    useEffect(() => { saveRef.current    = save;     }, [save]);

    useEffect(() => { setTitle(note?.title??''); setContent(note?.content??''); setSaved(false); }, [note?.id]);

    // Flush any pending save on unmount so content is never lost
    useEffect(() => () => {
        mounted.current = false;
        clearTimeout(timer.current);
        const n = noteRef.current;
        const t = titleRef.current;
        const c = contentRef.current;
        // Always save on unmount if there's any content — avoids losing notes with no title
        const hasContent = t.trim() !== '' || c.trim() !== '';
        const titleChanged   = t   !== (n.title   ?? '');
        const contentChanged = c   !== (n.content ?? '');
        if (n?.id && hasContent && (titleChanged || contentChanged)) {
            // Fire-and-forget — component is gone, no state updates needed
            saveRef.current(n.id, { title: t, content: c }).catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (!note?.id) return;
        // Treat null/undefined as empty string for comparison
        const prevTitle   = note.title   ?? '';
        const prevContent = note.content ?? '';
        // Don't auto-save if nothing has actually changed
        if (title === prevTitle && content === prevContent) return;
        // Don't auto-save a truly blank note (no title AND no content)
        if (title.trim() === '' && content.trim() === '') return;
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            if (!mounted.current) return;
            setSaving(true); setSaved(false);
            try { await save(note.id, { title, content }); if (mounted.current) { setSaving(false); setSaved(true); setTimeout(()=>{ if(mounted.current) setSaved(false); }, 2000); } }
            catch { if (mounted.current) setSaving(false); }
        }, 200);
        return () => clearTimeout(timer.current);
    }, [title, content]); // eslint-disable-line

    return { title, setTitle, content, setContent, saving, saved };
}
