import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState(''); const [method, setMethod] = useState('link');
    const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [load, setLoad] = useState(false);
    const navigate = useNavigate();
    const submit = async e => {
        e.preventDefault(); setMsg(''); setErr(''); setLoad(true);
        try {
            const {data} = await api.post('/auth/forgot-password', {email, method});
            if (method === 'otp') {
                // Redirect sang trang nhập OTP, email đã điền sẵn
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                setMsg(data.message);
            }
        } catch(e) {
            setErr(e.response?.data?.message || 'Error');
        } finally {
            setLoad(false);
        }
    };
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm" style={{width:'100%',maxWidth:420}}><div className="card-body p-4">
                <h4 className="mb-1 fw-bold text-center">Forgot Password</h4>
                <p className="text-muted text-center small mb-4">We'll send a reset link or OTP to your email.</p>
                {msg&&<div className="alert alert-success py-2">{msg}</div>}{err&&<div className="alert alert-danger py-2">{err}</div>}
                <form onSubmit={submit} noValidate>
                    <div className="mb-3"><label className="form-label">Email address</label><input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/></div>
                    <div className="mb-3"><label className="form-label">Reset method</label>
                        <div className="d-flex gap-3">
                            {[['link','Email link'],['otp','OTP code']].map(([v,l])=>(
                                <div key={v} className="form-check"><input className="form-check-input" type="radio" id={v} value={v} checked={method===v} onChange={()=>setMethod(v)}/><label className="form-check-label" htmlFor={v}>{l}</label></div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={load}>{load?'Sending…':'Send Reset'}</button>
                </form>
                <div className="text-center mt-3 small"><Link to="/login">Back to Sign In</Link></div>
            </div></div>
        </div>
    );
}

export function ResetPasswordPage() {
    const [sp] = useSearchParams(); const navigate = useNavigate();
    const tokenUrl = sp.get('token')||''; const emailUrl = sp.get('email')||'';
    const [otp, setOtp] = useState(''); const [email, setEmail] = useState(emailUrl); const [token, setToken] = useState(tokenUrl);
    const [otpMode, setOtpMode] = useState(!tokenUrl);
    const [pw, setPw] = useState(''); const [conf, setConf] = useState('');
    const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [load, setLoad] = useState(false);

    const verifyOtp = async e => { e.preventDefault(); setErr(''); setLoad(true); try { const {data}=await api.post('/auth/verify-otp',{email,otp}); setToken(data.token); setOtpMode(false); setMsg('OTP verified.'); } catch(e){ setErr(e.response?.data?.message||'Invalid OTP.'); } finally { setLoad(false); } };
    const reset = async e => { e.preventDefault(); if (pw!==conf) { setErr('Passwords do not match.'); return; } setErr(''); setLoad(true); try { const {data}=await api.post('/auth/reset-password',{email,token,password:pw,password_confirmation:conf}); setMsg(data.message+' Redirecting…'); setTimeout(()=>navigate('/login'),2500); } catch(e){ setErr(e.response?.data?.message||'Reset failed.'); } finally { setLoad(false); } };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm" style={{width:'100%',maxWidth:420}}><div className="card-body p-4">
                <h4 className="mb-4 fw-bold text-center">Reset Password</h4>
                {msg&&<div className="alert alert-success py-2">{msg}</div>}{err&&<div className="alert alert-danger py-2">{err}</div>}
                {otpMode ? (
                    <form onSubmit={verifyOtp} noValidate>
                        <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
                        <div className="mb-3"><label className="form-label">6-digit OTP</label><input type="text" className="form-control text-center fw-bold" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} style={{letterSpacing:'0.5rem',fontSize:'1.5rem'}} required/></div>
                        <button type="submit" className="btn btn-primary w-100" disabled={load}>{load?'Verifying…':'Verify OTP'}</button>
                    </form>
                ) : (
                    <form onSubmit={reset} noValidate>
                        <div className="mb-3"><label className="form-label">New password</label><input type="password" className="form-control" value={pw} onChange={e=>setPw(e.target.value)} required/></div>
                        <div className="mb-3"><label className="form-label">Confirm new password</label><input type="password" className="form-control" value={conf} onChange={e=>setConf(e.target.value)} required/></div>
                        <button type="submit" className="btn btn-primary w-100" disabled={load}>{load?'Resetting…':'Reset Password'}</button>
                    </form>
                )}
                <div className="text-center mt-3 small"><Link to="/login">Back to Sign In</Link></div>
            </div></div>
        </div>
    );
}

export function VerifyEmailPage() {
    const [sp] = useSearchParams(); const { refreshUser } = useAuth();
    const [status, setStatus] = useState('loading'); const [message, setMessage] = useState('');
    useState(() => {
        const t = sp.get('token');
        if (!t) { setStatus('error'); setMessage('Missing token.'); return; }
        api.get(`/auth/verify-email?token=${t}`).then(({data})=>{ setStatus('success'); setMessage(data.message); refreshUser().catch(()=>{}); }).catch(e=>{ setStatus('error'); setMessage(e.response?.data?.message||'Verification failed.'); });
    }, []);
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm text-center" style={{width:'100%',maxWidth:400}}><div className="card-body p-4">
                {status==='loading'&&<><div className="spinner-border text-primary mb-3"/><p>Verifying…</p></>}
                {status==='success'&&<><div style={{fontSize:48}}>✅</div><h5 className="mt-2 fw-bold">Account Activated!</h5><p className="text-muted">{message}</p><Link to="/" className="btn btn-primary">Go to Home</Link></>}
                {status==='error'&&<><div style={{fontSize:48}}>❌</div><h5 className="mt-2 fw-bold">Verification Failed</h5><p className="text-muted">{message}</p><Link to="/login" className="btn btn-outline-primary">Back to Login</Link></>}
            </div></div>
        </div>
    );
}
