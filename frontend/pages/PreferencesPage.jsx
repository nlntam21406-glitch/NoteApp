import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const NOTE_COLORS = [
    { label: 'White',  value: '#ffffff' }, { label: 'Yellow', value: '#fef9c3' },
    { label: 'Green',  value: '#dcfce7' }, { label: 'Blue',   value: '#dbeafe' },
    { label: 'Pink',   value: '#fce7f3' }, { label: 'Purple', value: '#ede9fe' },
    { label: 'Orange', value: '#ffedd5' }, { label: 'Gray',   value: '#f3f4f6' },
];

/* Reusable section card */
function SettingsCard({ title, children }) {
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 22px',
            marginBottom: 16,
            boxShadow: 'var(--shadow-sm)',
        }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>{title}</h2>
            {children}
        </div>
    );
}

/* Reusable field */
function Field({ label, children }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                {label}
            </label>
            {children}
        </div>
    );
}

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
    const [displayName,    setDisplayName]    = useState(user?.display_name ?? '');
    const [profileSaved,   setProfileSaved]   = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError,   setProfileError]   = useState('');

    // Avatar state
    const fileRef = useRef();
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarMsg,     setAvatarMsg]     = useState('');

    // Change password state
    const [pwForm, setPwForm]   = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwSaved, setPwSaved] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError]   = useState('');

    // Theme
    const [themeSaving, setThemeSaving] = useState(false);
    const [themeMsg,    setThemeMsg]    = useState('');

    const handleThemeChange = useCallback(async (newTheme) => {
        setTheme(newTheme);
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        document.documentElement.classList.toggle('dark-mode', newTheme === 'dark');
        setThemeSaving(true); setThemeMsg('');
        try {
            await updatePreferences({ theme: newTheme });
            setThemeMsg('✓ Saved');
            setTimeout(() => setThemeMsg(''), 2000);
        } catch {
            const reverted = newTheme === 'dark' ? 'light' : 'dark';
            setTheme(reverted);
            document.documentElement.setAttribute('data-bs-theme', reverted);
            document.documentElement.classList.toggle('dark-mode', reverted === 'dark');
            setThemeMsg('⚠ Failed to save');
            setTimeout(() => setThemeMsg(''), 3000);
        } finally { setThemeSaving(false); }
    }, [updatePreferences]);

    const handleSave = async () => {
        setLoading(true); setError(''); setSaved(false);
        try { await updatePreferences({ fontSize, noteColor, theme }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch { setError('Failed to save preferences.'); }
        finally { setLoading(false); }
    };

    const handleProfileSave = async () => {
        setProfileLoading(true); setProfileError(''); setProfileSaved(false);
        try {
            await api.put('/user/profile', { display_name: displayName });
            await refreshUser();
            setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000);
        } catch (e) { setProfileError(e.response?.data?.message || 'Failed to update profile.'); }
        finally { setProfileLoading(false); }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        setAvatarLoading(true); setAvatarMsg('');
        try {
            const fd = new FormData(); fd.append('avatar', file);
            await api.post('/user/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            await refreshUser();
            setAvatarMsg('Avatar updated!'); setTimeout(() => setAvatarMsg(''), 3000);
        } catch (e) { setAvatarMsg(e.response?.data?.message || 'Failed to upload avatar.'); }
        finally { setAvatarLoading(false); e.target.value = ''; }
    };

    const handleRemoveAvatar = async () => {
        setAvatarLoading(true); setAvatarMsg('');
        try { await api.delete('/user/avatar'); await refreshUser(); setAvatarMsg('Avatar removed.'); setTimeout(() => setAvatarMsg(''), 3000); }
        catch (e) { setAvatarMsg(e.response?.data?.message || 'Failed to remove avatar.'); }
        finally { setAvatarLoading(false); }
    };

    const handlePasswordChange = async () => {
        setPwLoading(true); setPwError(''); setPwSaved(false);
        try {
            await api.put('/user/password', pwForm);
            setPwSaved(true); setPwForm({ current_password: '', password: '', password_confirmation: '' });
            setTimeout(() => setPwSaved(false), 3000);
        } catch (e) { setPwError(e.response?.data?.message || 'Failed to change password.'); }
        finally { setPwLoading(false); }
    };

    const avatarUrl = user?.avatar_url;
    const initials  = (user?.display_name || 'U').charAt(0).toUpperCase();

    const inputStyle = {
        width: '100%', padding: '9px 12px', fontSize: '0.9rem',
        border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', color: 'var(--text)',
        fontFamily: 'var(--font-base)', outline: 'none', transition: 'var(--transition)',
    };
    const btnPrimary = {
        background: 'var(--primary)', color: '#fff', border: 'none',
        borderRadius: 'var(--radius-sm)', padding: '8px 18px', fontSize: '0.875rem',
        fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-base)', transition: 'var(--transition)',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-base)' }}>

            {/* Header */}
            <div style={{
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16,
                position: 'sticky', top: 0, zIndex: 10, boxShadow: 'var(--shadow-sm)',
            }}>
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }} id="back-link">
                    ← Back
                </Link>
                <div style={{ width: 1, height: 18, background: 'var(--border)' }} />
                <h1 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>⚙️ Settings</h1>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 20px' }}>

                {/* ── Profile & Avatar ── */}
                <SettingsCard title="👤 Profile">
                    {profileError && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.875rem' }}>{profileError}</div>}
                    {profileSaved && <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>✓ Profile updated!</div>}

                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar"
                                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-focus)' }} />
                            ) : (
                                <div style={{
                                    width: 72, height: 72, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: 28, fontWeight: 700,
                                }}>
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div>
                            <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handleAvatarUpload} />
                            <button style={{ ...btnPrimary, background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)', marginRight: 8, fontSize: '0.82rem' }}
                                onClick={() => fileRef.current?.click()} disabled={avatarLoading} id="change-avatar-btn">
                                {avatarLoading ? 'Uploading…' : '📷 Change avatar'}
                            </button>
                            {avatarUrl && (
                                <button style={{ ...btnPrimary, background: 'transparent', color: 'var(--danger)', border: '1.5px solid var(--danger)', fontSize: '0.82rem' }}
                                    onClick={handleRemoveAvatar} disabled={avatarLoading} id="remove-avatar-btn">
                                    Remove
                                </button>
                            )}
                            {avatarMsg && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>{avatarMsg}</p>}
                        </div>
                    </div>

                    <Field label="Display name">
                        <input type="text" style={inputStyle} value={displayName}
                            onChange={e => setDisplayName(e.target.value)} maxLength={100} id="display-name-input" />
                    </Field>
                    <Field label="Email">
                        <input type="text" style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} value={user?.email ?? ''} disabled />
                    </Field>
                    <button style={btnPrimary} onClick={handleProfileSave} disabled={profileLoading} id="save-profile-btn">
                        {profileLoading ? 'Saving…' : 'Update profile'}
                    </button>
                </SettingsCard>

                {/* ── Change Password ── */}
                <SettingsCard title="🔑 Change Password">
                    {pwError && <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '0.875rem' }}>{pwError}</div>}
                    {pwSaved && <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>✓ Password changed!</div>}
                    <Field label="Current password">
                        <input type="password" style={inputStyle} value={pwForm.current_password}
                            onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} id="current-password-input" />
                    </Field>
                    <Field label="New password">
                        <input type="password" style={inputStyle} value={pwForm.password}
                            onChange={e => setPwForm({ ...pwForm, password: e.target.value })} id="new-password-input" />
                    </Field>
                    <Field label="Confirm new password">
                        <input type="password" style={inputStyle} value={pwForm.password_confirmation}
                            onChange={e => setPwForm({ ...pwForm, password_confirmation: e.target.value })} id="confirm-password-input" />
                    </Field>
                    <button style={btnPrimary} onClick={handlePasswordChange}
                        disabled={pwLoading || !pwForm.current_password || !pwForm.password} id="change-password-btn">
                        {pwLoading ? 'Changing…' : 'Change password'}
                    </button>
                </SettingsCard>

                {/* ── Theme ── */}
                <SettingsCard title="🎨 Appearance">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>Dark Mode</p>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switches and saves instantly</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {themeMsg && <small style={{ color: themeMsg.startsWith('⚠') ? 'var(--danger)' : 'var(--success)' }}>{themeMsg}</small>}
                            {themeSaving && <div className="spinner-border spinner-border-sm text-primary" role="status" />}
                            <div className="form-check form-switch mb-0">
                                <input
                                    className="form-check-input" type="checkbox" role="switch" id="themeToggle"
                                    style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                                    checked={theme === 'dark'}
                                    disabled={themeSaving}
                                    onChange={e => handleThemeChange(e.target.checked ? 'dark' : 'light')}
                                />
                                <label className="form-check-label ms-2 fw-semibold" htmlFor="themeToggle" style={{ fontSize: '0.875rem', color: 'var(--text)' }}>
                                    {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                </label>
                            </div>
                        </div>
                    </div>
                </SettingsCard>

                {/* ── Font size ── */}
                <SettingsCard title="✏️ Note Font Size">
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        {[['small', 'Small', '0.8rem'], ['medium', 'Medium', '1rem'], ['large', 'Large', '1.25rem']].map(([v, l, s]) => (
                            <button
                                key={v}
                                onClick={() => setFontSize(v)}
                                style={{
                                    flex: 1, padding: '9px 0', fontSize: s, fontWeight: 600,
                                    border: `2px solid ${fontSize === v ? 'var(--primary)' : 'var(--border)'}`,
                                    borderRadius: 'var(--radius-sm)',
                                    background: fontSize === v ? 'var(--primary-light)' : 'var(--surface)',
                                    color: fontSize === v ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer', fontFamily: 'var(--font-base)', transition: 'var(--transition)',
                                }}
                                id={`font-${v}`}
                            >{l}</button>
                        ))}
                    </div>
                    <div style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)', background: 'var(--surface-2)',
                        fontSize: fontSize === 'small' ? '0.8rem' : fontSize === 'large' ? '1.25rem' : '1rem',
                        color: 'var(--text-muted)', transition: 'font-size 0.2s',
                    }}>
                        Preview: The quick brown fox jumps over the lazy dog.
                    </div>
                </SettingsCard>

                {/* ── Default note color ── */}
                <SettingsCard title="🎨 Default Note Color">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                        {NOTE_COLORS.map(({ label, value }) => (
                            <button
                                key={value}
                                title={label}
                                onClick={() => setNoteColor(value)}
                                style={{
                                    width: 38, height: 38, borderRadius: '50%', background: value, cursor: 'pointer',
                                    border: noteColor === value ? '3px solid var(--primary)' : '2px solid var(--border)',
                                    transform: noteColor === value ? 'scale(1.25)' : 'scale(1)',
                                    transition: 'var(--transition)', outline: 'none',
                                }}
                                id={`color-${label.toLowerCase()}`}
                            />
                        ))}
                    </div>
                    <div style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)', background: noteColor,
                        transition: 'background 0.3s',
                    }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>Note preview</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#555' }}>This is how your notes will look.</p>
                    </div>
                </SettingsCard>

                {/* Save preferences */}
                {error  && <div className="alert alert-danger  py-2 mb-3" style={{ fontSize: '0.875rem' }}>{error}</div>}
                {saved  && <div className="alert alert-success py-2 mb-3" style={{ fontSize: '0.875rem' }}>✓ Preferences saved!</div>}
                <button style={{ ...btnPrimary, padding: '11px 28px', fontSize: '0.95rem' }} onClick={handleSave} disabled={loading} id="save-prefs-btn">
                    {loading ? 'Saving…' : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
}
