// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser]     = useState(null);
    const [loading, setLoad]  = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoad(false); return; }
        api.get('/auth/me').then(({data}) => setUser(data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoad(false));
    }, []);

    const login    = useCallback(async (email, password) => { const {data} = await api.post('/auth/login',{email,password}); localStorage.setItem('token',data.token); setUser(data.user); return data.user; }, []);
    const register = useCallback(async (email, display_name, password, password_confirmation) => { const {data} = await api.post('/auth/register',{email,display_name,password,password_confirmation}); localStorage.setItem('token',data.token); setUser(data.user); return data.user; }, []);
    const logout   = useCallback(async () => { await api.post('/auth/logout').catch(()=>{}); localStorage.removeItem('token'); setUser(null); }, []);
    const refreshUser = useCallback(async () => { const {data} = await api.get('/auth/me'); setUser(data.user); }, []);
    const updatePreferences = useCallback(async (prefs) => { const {data} = await api.put('/user/preferences', prefs); setUser(p => ({...p, preferences: data.preferences})); return data.preferences; }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, updatePreferences, isAuthenticated: !!user, isVerified: user?.is_verified ?? false }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);
