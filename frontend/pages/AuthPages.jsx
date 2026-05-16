// LoginPage + RegisterPage — improved UI, same functionality
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotebookPen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* Shared layout wrapper */
function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <NotebookPen size={28} strokeWidth={2.2} />
                        NoteApp
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>{title}</h1>
                    <p className="auth-subtitle mb-0">{subtitle}</p>
                </div>
                {children}
            </div>
        </div>
    );
}

/* Reusable field */
function Field({ label, type = 'text', value, onChange, error, autoFocus, placeholder }) {
    return (
        <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                {label}
            </label>
            <input
                type={type}
                className={`form-control${error ? ' is-invalid' : ''}`}
                value={value}
                onChange={onChange}
                required
                autoFocus={autoFocus}
                placeholder={placeholder}
                style={{ fontSize: '0.95rem' }}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
}

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [f, setF] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');
    const [load, setLoad] = useState(false);

    const submit = async e => {
        e.preventDefault(); setErr(''); setLoad(true);
        try { await login(f.email, f.password); navigate('/'); }
        catch (e) {
            const msg = e.response?.data?.message || 'Login failed. Please check your credentials.';
            setErr(msg);
            window.alert('Lỗi đăng nhập:\n' + msg);
        }
        finally { setLoad(false); }
    };

    return (
        <AuthLayout title="Welcome back" subtitle="Sign in to access your notes">
            {err && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.875rem' }}>
                    <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} /> {err}
                </div>
            )}
            <form onSubmit={submit} noValidate>
                <Field label="Email address" type="email" value={f.email}
                    onChange={e => setF({ ...f, email: e.target.value })}
                    autoFocus placeholder="you@example.com" />
                <Field label="Password" type="password" value={f.password}
                    onChange={e => setF({ ...f, password: e.target.value })}
                    placeholder="••••••••" />

                <button
                    type="submit"
                    className="btn btn-primary w-100 mt-1"
                    disabled={load}
                    style={{ padding: '0.65rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
                >
                    {load ? <><span className="spinner-border spinner-border-sm me-2" role="status"/>Signing in…</> : 'Sign In'}
                </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                    Forgot password?
                </Link>
                <span className="mx-2" style={{ color: 'var(--border)' }}>|</span>
                <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                    Create account
                </Link>
            </div>
        </AuthLayout>
    );
}

export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [f, setF] = useState({ email: '', display_name: '', password: '', password_confirmation: '' });
    const [errs, setErrs] = useState({});
    const [load, setLoad] = useState(false);

    const submit = async e => {
        e.preventDefault(); setErrs({});
        if (f.password !== f.password_confirmation) {
            setErrs({ password_confirmation: 'Passwords do not match.' }); return;
        }
        setLoad(true);
        try { await register(f.email, f.display_name, f.password, f.password_confirmation); navigate('/'); }
        catch (e) {
            const ae = e.response?.data?.errors;
            if (ae) {
                setErrs(Object.fromEntries(Object.entries(ae).map(([k, v]) => [k, v[0]])));
                window.alert('Lỗi đăng ký:\n' + Object.values(ae).map(v => v[0]).join('\n'));
            } else {
                const msg = e.response?.data?.message || 'Registration failed.';
                setErrs({ general: msg });
                window.alert('Lỗi đăng ký:\n' + msg);
            }
        }
        finally { setLoad(false); }
    };

    return (
        <AuthLayout title="Create account" subtitle="Start organizing your notes today">
            {errs.general && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3" style={{ fontSize: '0.875rem' }}>
                    <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} /> {errs.general}
                </div>
            )}
            <form onSubmit={submit} noValidate>
                <Field label="Email address" type="email" value={f.email}
                    onChange={e => setF({ ...f, email: e.target.value })}
                    error={errs.email} autoFocus placeholder="you@example.com" />
                <Field label="Display name" value={f.display_name}
                    onChange={e => setF({ ...f, display_name: e.target.value })}
                    error={errs.display_name} placeholder="Your name" />
                <Field label="Password" type="password" value={f.password}
                    onChange={e => setF({ ...f, password: e.target.value })}
                    error={errs.password} placeholder="At least 8 characters" />
                <Field label="Confirm password" type="password" value={f.password_confirmation}
                    onChange={e => setF({ ...f, password_confirmation: e.target.value })}
                    error={errs.password_confirmation} placeholder="Re-enter password" />

                <button
                    type="submit"
                    className="btn btn-primary w-100 mt-1"
                    disabled={load}
                    style={{ padding: '0.65rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
                >
                    {load ? <><span className="spinner-border spinner-border-sm me-2" role="status"/>Creating account…</> : 'Create Account'}
                </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}
