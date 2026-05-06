// LoginPage
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { login } = useAuth(); const navigate = useNavigate();
    const [f, setF] = useState({email:'',password:''}); const [err, setErr] = useState(''); const [load, setLoad] = useState(false);
    const submit = async e => { e.preventDefault(); setErr(''); setLoad(true); try { await login(f.email,f.password); navigate('/'); } catch(e) { setErr(e.response?.data?.message||'Login failed.'); } finally { setLoad(false); } };
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm" style={{width:'100%',maxWidth:420}}>
                <div className="card-body p-4">
                    <h4 className="mb-4 fw-bold text-center">Sign In</h4>
                    {err && <div className="alert alert-danger py-2">{err}</div>}
                    <form onSubmit={submit} noValidate>
                        <div className="mb-3"><label className="form-label">Email address</label><input type="email" className="form-control" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required autoFocus/></div>
                        <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required/></div>
                        <button type="submit" className="btn btn-primary w-100" disabled={load}>{load?'Signing in…':'Sign In'}</button>
                    </form>
                    <div className="text-center mt-3 small"><Link to="/forgot-password">Forgot password?</Link><span className="mx-2">·</span><Link to="/register">Create account</Link></div>
                </div>
            </div>
        </div>
    );
}

export function RegisterPage() {
    const { register } = useAuth(); const navigate = useNavigate();
    const [f, setF] = useState({email:'',display_name:'',password:'',password_confirmation:''});
    const [errs, setErrs] = useState({}); const [load, setLoad] = useState(false);
    const submit = async e => {
        e.preventDefault(); setErrs({});
        if (f.password!==f.password_confirmation) { setErrs({password_confirmation:'Passwords do not match.'}); return; }
        setLoad(true);
        try { await register(f.email,f.display_name,f.password,f.password_confirmation); navigate('/'); }
        catch(e) { const ae=e.response?.data?.errors; if(ae) setErrs(Object.fromEntries(Object.entries(ae).map(([k,v])=>[k,v[0]]))); else setErrs({general:e.response?.data?.message||'Registration failed.'}); }
        finally { setLoad(false); }
    };
    const field=(name,label,type='text')=>(
        <div className="mb-3"><label className="form-label">{label}</label>
        <input type={type} className={`form-control ${errs[name]?'is-invalid':''}`} value={f[name]} onChange={e=>setF({...f,[name]:e.target.value})} required/>
        {errs[name]&&<div className="invalid-feedback">{errs[name]}</div>}</div>
    );
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="card shadow-sm" style={{width:'100%',maxWidth:440}}>
                <div className="card-body p-4">
                    <h4 className="mb-4 fw-bold text-center">Create Account</h4>
                    {errs.general&&<div className="alert alert-danger py-2">{errs.general}</div>}
                    <form onSubmit={submit} noValidate>
                        {field('email','Email address','email')}
                        {field('display_name','Display name')}
                        {field('password','Password','password')}
                        {field('password_confirmation','Confirm password','password')}
                        <button type="submit" className="btn btn-primary w-100 mt-1" disabled={load}>{load?'Creating account…':'Create Account'}</button>
                    </form>
                    <div className="text-center mt-3 small">Already have an account? <Link to="/login">Sign in</Link></div>
                </div>
            </div>
        </div>
    );
}
