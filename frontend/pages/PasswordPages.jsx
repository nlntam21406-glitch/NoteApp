import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* Reuse the same auth layout style */
function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <div className="auth-logo">📝 NoteApp</div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>{title}</h1>
                    <p className="auth-subtitle mb-0">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, type = 'text', value, onChange, autoFocus, maxLength, style, placeholder }) {
    return (
        <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{label}</label>
            <input
                type={type}
                className="form-control"
                value={value}
                onChange={onChange}
                required
                autoFocus={autoFocus}
                maxLength={maxLength}
                placeholder={placeholder}
                style={{ fontSize: '0.95rem', ...style }}
            />
        </div>
    );
}

function Btn({ children, disabled, load }) {
    return (
        <button type="submit" className="btn btn-primary w-100 mt-1" disabled={disabled || load}
            style={{ padding: '0.65rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}>
            {load ? <><span className="spinner-border spinner-border-sm me-2" role="status"/>{children}</> : children}
        </button>
    );
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [method, setMethod] = useState('link');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [load, setLoad] = useState(false);
    const navigate = useNavigate();

    const submit = async e => {
        e.preventDefault(); setMsg(''); setErr(''); setLoad(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email, method });
            if (method === 'otp') {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                setMsg(data.message);
            }
        } catch (e) { setErr(e.response?.data?.message || 'Error'); }
        finally { setLoad(false); }
    };

    return (
        <AuthLayout title="Forgot Password" subtitle="We'll send a reset link or OTP to your email.">
            {msg && <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>✓ {msg}</div>}
            {err && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.875rem' }}>⚠️ {err}</div>}
            <form onSubmit={submit} noValidate>
                <Field label="Email address" type="email" value={email}
                    onChange={e => setEmail(e.target.value)} autoFocus placeholder="you@example.com" />

                <div className="mb-3">
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>Reset method</label>
                    <div className="d-flex gap-3">
                        {[['link', '📧 Email link'], ['otp', '🔢 OTP code']].map(([v, l]) => (
                            <label key={v} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text)' }}>
                                <input className="form-check-input m-0" type="radio" id={v} value={v}
                                    checked={method === v} onChange={() => setMethod(v)} />
                                {l}
                            </label>
                        ))}
                    </div>
                </div>

                <Btn load={load}>Send Reset</Btn>
            </form>
            <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>← Back to Sign In</Link>
            </div>
        </AuthLayout>
    );
}

export function ResetPasswordPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();
    const tokenUrl = sp.get('token') || '';
    const emailUrl = sp.get('email') || '';
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState(emailUrl);
    const [token, setToken] = useState(tokenUrl);
    const [otpMode, setOtpMode] = useState(!tokenUrl);
    const [pw, setPw] = useState('');
    const [conf, setConf] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [load, setLoad] = useState(false);

    const verifyOtp = async e => {
        e.preventDefault(); setErr(''); setLoad(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setToken(data.token); setOtpMode(false); setMsg('OTP verified.');
        } catch (e) { setErr(e.response?.data?.message || 'Invalid OTP.'); }
        finally { setLoad(false); }
    };

    const reset = async e => {
        e.preventDefault();
        if (pw !== conf) { setErr('Passwords do not match.'); return; }
        setErr(''); setLoad(true);
        try {
            const { data } = await api.post('/auth/reset-password', { email, token, password: pw, password_confirmation: conf });
            setMsg(data.message + ' Redirecting…');
            setTimeout(() => navigate('/login'), 2500);
        } catch (e) { setErr(e.response?.data?.message || 'Reset failed.'); }
        finally { setLoad(false); }
    };

    return (
        <AuthLayout title="Reset Password" subtitle={otpMode ? 'Enter the OTP sent to your email' : 'Choose your new password'}>
            {msg && <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>✓ {msg}</div>}
            {err && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.875rem' }}>⚠️ {err}</div>}

            {otpMode ? (
                <form onSubmit={verifyOtp} noValidate>
                    <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                    <div className="mb-3">
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>6-digit OTP</label>
                        <input type="text" className="form-control text-center fw-bold" maxLength={6}
                            value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            style={{ letterSpacing: '0.6rem', fontSize: '1.6rem', padding: '0.75rem' }} required />
                    </div>
                    <Btn load={load}>Verify OTP</Btn>
                </form>
            ) : (
                <form onSubmit={reset} noValidate>
                    <Field label="New password" type="password" value={pw}
                        onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" />
                    <Field label="Confirm new password" type="password" value={conf}
                        onChange={e => setConf(e.target.value)} placeholder="Re-enter password" />
                    <Btn load={load}>Reset Password</Btn>
                </form>
            )}

            <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>← Back to Sign In</Link>
            </div>
        </AuthLayout>
    );
}

export function VerifyEmailPage() {
    const [sp] = useSearchParams();
    const { refreshUser } = useAuth();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useState(() => {
        const t = sp.get('token');
        if (!t) { setStatus('error'); setMessage('Missing token.'); return; }
        api.get(`/auth/verify-email?token=${t}`)
            .then(({ data }) => { setStatus('success'); setMessage(data.message); refreshUser().catch(() => {}); })
            .catch(e => { setStatus('error'); setMessage(e.response?.data?.message || 'Verification failed.'); });
    }, []);

    const icon   = status === 'loading' ? null : status === 'success' ? '✅' : '❌';
    const color  = status === 'success' ? 'var(--success)' : 'var(--danger)';

    return (
        <AuthLayout
            title={status === 'loading' ? 'Verifying…' : status === 'success' ? 'Account Activated!' : 'Verification Failed'}
            subtitle={status === 'loading' ? 'Please wait a moment.' : message}
        >
            <div className="text-center py-2">
                {status === 'loading' && <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} />}
                {icon && <div style={{ fontSize: 56 }}>{icon}</div>}
                {status === 'success' && (
                    <Link to="/" className="btn btn-primary mt-3" style={{ borderRadius: 'var(--radius-md)', padding: '0.6rem 2rem' }}>
                        Go to My Notes
                    </Link>
                )}
                {status === 'error' && (
                    <Link to="/login" className="btn btn-outline-primary mt-3" style={{ borderRadius: 'var(--radius-md)' }}>
                        Back to Login
                    </Link>
                )}
            </div>
        </AuthLayout>
    );
}
