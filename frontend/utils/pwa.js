// src/utils/pwa.js
import { registerSyncListeners, syncToServer } from './syncManager';
export function registerPWA() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', async () => {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            navigator.serviceWorker.addEventListener('message', e => { if (e.data?.type==='TRIGGER_SYNC') syncToServer(); });
        } catch(e) { console.warn('[PWA] SW failed:', e); }
    });
    registerSyncListeners();
}
export async function requestBackgroundSync() {
    if (!('serviceWorker' in navigator)) return;
    try { const reg = await navigator.serviceWorker.ready; if ('sync' in reg) await reg.sync.register('sync-notes'); }
    catch { syncToServer(); }
}
