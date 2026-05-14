import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function UnverifiedBanner() {
    const { isVerified, isAuthenticated } = useAuth();
    const [sent, setSent] = useState(false);
    const [loading, setLoad] = useState(false);

    if (!isAuthenticated || isVerified) return null;

    const resend = async () => {
        setLoad(true);
        try { await api.post('/auth/resend-verification'); setSent(true); }
        finally { setLoad(false); }
    };

    return (
        <div
            role="alert"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                color: '#1c1917',
                fontSize: '0.875rem',
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 1060,
                boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                fontFamily: 'var(--font-base)',
                gap: 12,
            }}
        >
            <span>⚠️ Your account is <strong>unverified</strong>. Please check your email to complete activation.</span>
            {sent ? (
                <span style={{ color: '#065f46', background: '#d1fae5', padding: '3px 12px', borderRadius: 99, fontSize: '0.8rem' }}>
                    ✓ Email sent!
                </span>
            ) : (
                <button
                    onClick={resend}
                    disabled={loading}
                    style={{
                        border: 'none',
                        background: '#1c1917',
                        color: '#fff',
                        padding: '5px 14px',
                        borderRadius: 99,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontFamily: 'var(--font-base)',
                        transition: 'opacity 0.2s',
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    {loading ? 'Sending…' : 'Resend Email'}
                </button>
            )}
        </div>
    );
}
