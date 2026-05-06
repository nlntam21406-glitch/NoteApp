import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function UnverifiedBanner() {
    const { isVerified, isAuthenticated } = useAuth();
    const [sent, setSent] = useState(false);
    const [loading, setLoad] = useState(false);
    if (!isAuthenticated || isVerified) return null;
    const resend = async () => { setLoad(true); try { await api.post('/auth/resend-verification'); setSent(true); } finally { setLoad(false); } };
    return (
        <div className="d-flex align-items-center justify-content-between px-4 py-2 fw-semibold"
            style={{ background:'#f59e0b',color:'#1c1917',fontSize:'0.9rem',position:'sticky',top:0,zIndex:1050,boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }} role="alert">
            <span>⚠️&nbsp; Your account is <strong>unverified</strong>. Please check your email to complete activation.</span>
            {sent ? <span className="text-success fw-bold ms-3">✓ Email sent!</span> :
                <button onClick={resend} disabled={loading} className="btn btn-sm ms-3" style={{background:'#1c1917',color:'#fff',border:'none'}}>
                    {loading ? 'Sending…' : 'Resend Email'}
                </button>}
        </div>
    );
}
