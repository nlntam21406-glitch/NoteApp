import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NOTE_COLORS = [
    { label:'White',  value:'#ffffff' }, { label:'Yellow', value:'#fef9c3' },
    { label:'Green',  value:'#dcfce7' }, { label:'Blue',   value:'#dbeafe' },
    { label:'Pink',   value:'#fce7f3' }, { label:'Purple', value:'#ede9fe' },
    { label:'Orange', value:'#ffedd5' }, { label:'Gray',   value:'#f3f4f6' },
];

export default function PreferencesPage() {
    const { user, updatePreferences, refreshUser } = useAuth();
    const prefs = user?.preferences ?? {};
    const [fontSize,  setFontSize]  = useState(prefs.fontSize  ?? 'medium');
    const [noteColor, setNoteColor] = useState(prefs.noteColor ?? '#ffffff');
    const [theme,     setTheme]     = useState(prefs.theme     ?? 'light');
    const [saved,     setSaved]     = useState(false);
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');

    // Profile state
    const [displayName, setDisplayName] = useState(user?.display_name ?? '');
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Avatar state
    const fileRef = useRef();
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarMsg, setAvatarMsg] = useState('');

    // Change password state
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwSaved, setPwSaved] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');

    // Apply theme instantly on toggle AND auto-save to DB
    const [themeSaving, setThemeSaving] = useState(false);
    const [themeMsg,    setThemeMsg]    = useState('');
    const handleThemeChange = useCallback(async (newTheme) => {
        setTheme(newTheme);
        // Apply to DOM immediately so user sees the change right away
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        document.documentElement.classList.toggle('dark-mode', newTheme === 'dark');
        // Auto-save theme to DB so it persists on reload
        setThemeSaving(true); setThemeMsg('');
        try {
            await updatePreferences({ theme: newTheme });
            setThemeMsg('✓ Saved');
            setTimeout(() => setThemeMsg(''), 2000);
        } catch {
            // Revert DOM if save failed
            const reverted = newTheme === 'dark' ? 'light' : 'dark';
            setTheme(reverted);
            document.documentElement.setAttribute('data-bs-theme', reverted);
            document.documentElement.classList.toggle('dark-mode', reverted === 'dark');
            setThemeMsg('⚠ Failed to save');
            setTimeout(() => setThemeMsg(''), 3000);
        } finally {
            setThemeSaving(false);
        }
    }, [updatePreferences]);

    const handleSave = async () => {
        setLoading(true); setError(''); setSaved(false);
        try { await updatePreferences({ fontSize, noteColor, theme }); setSaved(true); setTimeout(()=>setSaved(false),3000); }
        catch { setError('Failed to save preferences.'); }
        finally { setLoading(false); }
    };

    const handleProfileSave = async () => {
        setProfileLoading(true); setProfileError(''); setProfileSaved(false);
        try {
            await api.put('/user/profile', { display_name: displayName });
            await refreshUser();
            setProfileSaved(true); setTimeout(()=>setProfileSaved(false),3000);
        }
        catch(e) { setProfileError(e.response?.data?.message || 'Failed to update profile.'); }
        finally { setProfileLoading(false); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarLoading(true); setAvatarMsg('');
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            await api.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            await refreshUser();
            setAvatarMsg('Avatar updated!');
            setTimeout(() => setAvatarMsg(''), 3000);
        }
        catch(e) { setAvatarMsg(e.response?.data?.message || 'Failed to upload avatar.'); }
        finally { setAvatarLoading(false); e.target.value = ''; }
    };

    const handleRemoveAvatar = async () => {
        setAvatarLoading(true); setAvatarMsg('');
        try {
            await api.delete('/user/avatar');
            await refreshUser();
            setAvatarMsg('Avatar removed.');
            setTimeout(() => setAvatarMsg(''), 3000);
        }
        catch(e) { setAvatarMsg(e.response?.data?.message || 'Failed to remove avatar.'); }
        finally { setAvatarLoading(false); }
    };

    const handlePasswordChange = async () => {
        setPwLoading(true); setPwError(''); setPwSaved(false);
        try {
            await api.put('/user/password', pwForm);
            setPwSaved(true); setPwForm({ current_password: '', password: '', password_confirmation: '' });
            setTimeout(()=>setPwSaved(false),3000);
        }
        catch(e) { setPwError(e.response?.data?.message || 'Failed to change password.'); }
        finally { setPwLoading(false); }
    };

    const avatarUrl = user?.avatar_url;
    const initials = (user?.display_name || 'U').charAt(0).toUpperCase();

    return (
        <div className="container py-4" style={{maxWidth:600}}>
            <div className="d-flex align-items-center gap-3 mb-4">
                <a href="/" className="btn btn-outline-secondary btn-sm">← Back</a>
                <h4 className="fw-bold mb-0">Settings</h4>
            </div>

            {/* ── Profile & Avatar ─────────────────────────── */}
            <div className="card mb-3">
                <div className="card-body">
                    <h6 className="fw-semibold mb-3">👤 Profile</h6>
                    {profileError && <div className="alert alert-danger py-2">{profileError}</div>}
                    {profileSaved && <div className="alert alert-success py-2">✓ Profile updated!</div>}

                    {/* Avatar */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{position:'relative',width:64,height:64,flexShrink:0}}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover',border:'2px solid #e5e7eb'}}/>
                            ) : (
                                <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:24,fontWeight:'bold'}}>
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div>
                            <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarUpload}/>
                            <button className="btn btn-outline-primary btn-sm me-2" onClick={()=>fileRef.current?.click()} disabled={avatarLoading}>
                                {avatarLoading ? 'Uploading…' : '📷 Change avatar'}
                            </button>
                            {avatarUrl && <button className="btn btn-outline-danger btn-sm" onClick={handleRemoveAvatar} disabled={avatarLoading}>Remove</button>}
                            {avatarMsg && <div className="small text-muted mt-1">{avatarMsg}</div>}
                        </div>
                    </div>

                    {/* Display name */}
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Display name</label>
                        <input type="text" className="form-control" value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={100}/>
                    </div>
                    <div className="mb-2">
                        <label className="form-label small fw-semibold">Email</label>
                        <input type="text" className="form-control" value={user?.email ?? ''} disabled/>
                    </div>
                    <button onClick={handleProfileSave} disabled={profileLoading} className="btn btn-primary btn-sm">
                        {profileLoading ? 'Saving…' : 'Update profile'}
                    </button>
                </div>
            </div>

            {/* ── Change Password ──────────────────────────── */}
            <div className="card mb-3">
                <div className="card-body">
                    <h6 className="fw-semibold mb-3">🔑 Change Password</h6>
                    {pwError && <div className="alert alert-danger py-2">{pwError}</div>}
                    {pwSaved && <div className="alert alert-success py-2">✓ Password changed!</div>}
                    <div className="mb-2">
                        <label className="form-label small fw-semibold">Current password</label>
                        <input type="password" className="form-control" value={pwForm.current_password} onChange={e=>setPwForm({...pwForm,current_password:e.target.value})}/>
                    </div>
                    <div className="mb-2">
                        <label className="form-label small fw-semibold">New password</label>
                        <input type="password" className="form-control" value={pwForm.password} onChange={e=>setPwForm({...pwForm,password:e.target.value})}/>
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-semibold">Confirm new password</label>
                        <input type="password" className="form-control" value={pwForm.password_confirmation} onChange={e=>setPwForm({...pwForm,password_confirmation:e.target.value})}/>
                    </div>
                    <button onClick={handlePasswordChange} disabled={pwLoading || !pwForm.current_password || !pwForm.password} className="btn btn-primary btn-sm">
                        {pwLoading ? 'Changing…' : 'Change password'}
                    </button>
                </div>
            </div>

            {/* ── Theme ────────────────────────────────────── */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <h6 className="mb-0 fw-semibold">Dark Mode</h6>
                            <small className="text-muted">Switches and saves instantly</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {themeMsg && <small className={themeMsg.startsWith('⚠') ? 'text-danger' : 'text-success'}>{themeMsg}</small>}
                            {themeSaving && <div className="spinner-border spinner-border-sm text-primary" role="status"/>}
                            <div className="form-check form-switch ms-1 mb-0">
                                <input className="form-check-input" type="checkbox" role="switch" id="themeToggle"
                                    style={{width:'3rem',height:'1.5rem',cursor:'pointer'}}
                                    checked={theme==='dark'}
                                    disabled={themeSaving}
                                    onChange={e=>handleThemeChange(e.target.checked?'dark':'light')}/>
                                <label className="form-check-label ms-2 fw-semibold" htmlFor="themeToggle">
                                    {theme==='dark'?'🌙 Dark':'☀️ Light'}
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Font size ────────────────────────────────── */}
            <div className="card mb-3">
                <div className="card-body">
                    <h6 className="fw-semibold mb-3">Note Font Size</h6>
                    <div className="d-flex gap-3">
                        {[['small','Small','0.8rem'],['medium','Medium','1rem'],['large','Large','1.25rem']].map(([v,l,s])=>(
                            <button key={v} onClick={()=>setFontSize(v)} className={`btn flex-fill ${fontSize===v?'btn-primary':'btn-outline-secondary'}`} style={{fontSize:s}}>{l}</button>
                        ))}
                    </div>
                    <div className="mt-3 p-3 border rounded" style={{fontSize:fontSize==='small'?'0.8rem':fontSize==='large'?'1.25rem':'1rem'}}>
                        <span className="text-muted">Preview: The quick brown fox jumps over the lazy dog.</span>
                    </div>
                </div>
            </div>

            {/* ── Note color ───────────────────────────────── */}
            <div className="card mb-4">
                <div className="card-body">
                    <h6 className="fw-semibold mb-3">Default Note Color</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {NOTE_COLORS.map(({label,value})=>(
                            <button key={value} title={label} onClick={()=>setNoteColor(value)} style={{width:36,height:36,borderRadius:'50%',background:value,border:noteColor===value?'3px solid #4f46e5':'2px solid #d1d5db',cursor:'pointer',transition:'transform 0.1s',transform:noteColor===value?'scale(1.2)':'scale(1)'}}/>
                        ))}
                    </div>
                    <div className="mt-3 p-3 border rounded" style={{background:noteColor,transition:'background 0.3s'}}>
                        <span className="fw-semibold">Note preview</span>
                        <p className="mb-0 text-muted small">This is how your notes will look.</p>
                    </div>
                </div>
            </div>

            {error  && <div className="alert alert-danger  py-2">{error}</div>}
            {saved  && <div className="alert alert-success py-2">✓ Preferences saved!</div>}

            <button onClick={handleSave} disabled={loading} className="btn btn-primary px-4">
                {loading?'Saving…':'Save Preferences'}
            </button>
        </div>
    );
}
