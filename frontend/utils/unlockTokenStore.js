// src/utils/unlockTokenStore.js — In-memory only, NOT persisted
const store = new Map();
export const unlockTokenStore = {
    set(id, token, ms = 7200000) { store.set(id, { token, exp: Date.now() + ms }); },
    get(id) { const e = store.get(id); if (!e) return null; if (Date.now() > e.exp) { store.delete(id); return null; } return e.token; },
    clear(id) { store.delete(id); },
    isUnlocked(id) { return !!this.get(id); },
};
