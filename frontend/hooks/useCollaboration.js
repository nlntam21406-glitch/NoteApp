// src/hooks/useCollaboration.js
import { useEffect, useRef } from 'react';

let echoInstance = null;

async function getEcho() {
    if (echoInstance) return echoInstance;
    try {
        const [{ default: Echo }, { default: Pusher }] = await Promise.all([
            import('laravel-echo'),
            import('pusher-js'),
        ]);
        window.Pusher = Pusher;
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY || 'noteapp',
            wsHost: window.location.hostname,
            wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
            wssPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080'),
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/api/broadcasting/auth',
            auth: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' } },
        });
        return echoInstance;
    } catch (err) {
        console.warn('[Collab] WebSocket unavailable:', err.message);
        return null;
    }
}

export function useCollaboration(noteId, canEdit, onRemoteUpdate) {
    const channelRef = useRef(null);
    useEffect(() => {
        if (!noteId || !canEdit) return;
        let active = true;
        getEcho().then(echo => {
            if (!echo || !active) return;
            channelRef.current = echo.join(`note.${noteId}`).listen('.note.updated', payload => {
                if (active) onRemoteUpdate?.(payload);
            });
        });
        return () => {
            active = false;
            getEcho().then(echo => { try { echo?.leave(`note.${noteId}`); } catch {} });
            channelRef.current = null;
        };
    }, [noteId, canEdit]); // eslint-disable-line
}
