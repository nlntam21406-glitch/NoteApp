// src/context/ThemeContext.jsx — applies theme to <html> tag reactively
import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext('light');

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const theme = user?.preferences?.theme ?? 'light';

    useEffect(() => {
        // Bootstrap 5.3+ supports data-bs-theme attribute for dark mode
        document.documentElement.setAttribute('data-bs-theme', theme);
        // Also set a CSS class for custom dark mode styles
        document.documentElement.classList.toggle('dark-mode', theme === 'dark');
        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#4f46e5');
    }, [theme]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
