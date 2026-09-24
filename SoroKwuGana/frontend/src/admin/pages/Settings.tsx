import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUpdateProfile, useUpdateSecurity, useMe } from '../hooks/useStats';
import { uploadImage } from '../lib/uploadImage';

// ── Icon ──────────────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  user:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  lock:    'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  eyeOff:  'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21',
  check:   'M5 13l4 4L19 7',
  upload:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  key:     'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  clock:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  shield:  'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  warn:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
};

type Tab = 'profile' | 'password' | 'security';

// ── Shared input class ────────────────────────────────────────────────────────
const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all placeholder:text-gray-400';

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-2.5 text-sm px-4 py-3 rounded-xl border font-medium ${
      type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <Icon d={type === 'success' ? IC.check : IC.warn} className="w-4 h-4 flex-shrink-0" />
      {msg}
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function Section({ title, desc, icon, children }: { title: string; desc: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#6C63FF]/10 flex items-center justify-center flex-shrink-0">
          <Icon d={icon} className="w-4.5 h-4.5 text-[#6C63FF]" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────
export default function Settings() {
  const { user: authUser, can } = useAuth();
  const { data: fullUser } = useMe();
  const updateProfile  = useUpdateProfile();
  const updateSecurity = useUpdateSecurity();

  const [tab, setTab] = useState<Tab>('profile');

  // Profile form
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [bio,    setBio]    = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);

  // Security form (SUPER_ADMIN only)
  const [jwtSecret,    setJwtSecret]    = useState('');
  const [jwtExpiresIn, setJwtExpiresIn] = useState('7d');
  const [showSecret,   setShowSecret]   = useState(false);

  // Feedback
  const [profileMsg,  setProfileMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // Populate from DB
  useEffect(() => {
    if (!fullUser) return;
    setName(fullUser.name ?? '');
    setEmail(fullUser.email ?? '');
    setBio(fullUser.bio ?? '');
    setAvatar(fullUser.avatar ?? '');
  }, [fullUser]);

  // ── Avatar upload ────────────────────────────────────────────────────────
  const handleAvatarFile = async (file: File | undefined) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadImage(file);
      setAvatar(url);
    } catch (e: unknown) {
      setProfileMsg({ type: 'error', text: (e as Error).message });
    } finally {
      setAvatarUploading(false);
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      await updateProfile.mutateAsync({ name, email, bio, avatar });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileMsg({ type: 'error', text: msg ?? 'Failed to update profile.' });
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPw !== confirmPw) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    try {
      await updateProfile.mutateAsync({ password: newPw, currentPassword: currentPw });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordMsg({ type: 'error', text: msg ?? 'Failed to change password.' });
    }
  };

  // ── Save security settings ────────────────────────────────────────────────
  const handleSecuritySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (!jwtSecret && !jwtExpiresIn) return;
    try {
      const payload: { jwtSecret?: string; jwtExpiresIn?: string } = { jwtExpiresIn };
      if (jwtSecret.trim()) payload.jwtSecret = jwtSecret.trim();
      const res = await updateSecurity.mutateAsync(payload);
      setSecurityMsg({ type: 'success', text: res.message ?? 'Security settings saved.' });
      setJwtSecret('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSecurityMsg({ type: 'error', text: msg ?? 'Failed to update security settings.' });
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile',  label: 'Profile',  icon: IC.user   },
    { key: 'password', label: 'Password', icon: IC.lock   },
    ...(can('SUPER_ADMIN') ? [{ key: 'security' as Tab, label: 'Security', icon: IC.shield }] : []),
  ];

  return (
    <div className="max-w-2xl space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account, password, and security preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key
                ? 'bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/20'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Icon d={t.icon} className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ─────────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-5">

          {/* Avatar */}
          <Section title="Profile Picture" desc="Your avatar shown across the admin panel." icon={IC.user}>
            <div className="flex items-center gap-5">
              {/* Preview */}
              <div className="relative flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-2xl font-black shadow-sm">
                    {authUser?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <Icon d={IC.upload} className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="text-xs font-semibold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">JPG, PNG, WebP up to 32 MB. Or paste a URL below.</p>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className={inputCls}
                />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleAvatarFile(e.target.files?.[0])} />
            </div>
          </Section>

          {/* Info */}
          <Section title="Personal Information" desc="Your name and email address." icon={IC.user}>
            {profileMsg && <Alert type={profileMsg.type} msg={profileMsg.text} />}
            <Field label="Full Name">
              <input value={name} onChange={e => setName(e.target.value)} required
                placeholder="Your full name" className={inputCls} />
            </Field>
            <Field label="Email Address">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com" className={inputCls} />
            </Field>
            <Field label="Bio" hint="Shown on your author profile. 500 characters max.">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="A short bio about yourself…"
                className={`${inputCls} resize-none`}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-mono ${bio.length > 450 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {bio.length}/500
                </span>
              </div>
            </Field>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-md"
              >
                {updateProfile.isPending
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                  : <><Icon d={IC.check} className="w-3.5 h-3.5" />Save Profile</>
                }
              </button>
            </div>
          </Section>
        </form>
      )}

      {/* ── Password Tab ────────────────────────────────────────────────────── */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordSave}>
          <Section title="Change Password" desc="Use a strong password with letters, numbers and symbols." icon={IC.lock}>
            {passwordMsg && <Alert type={passwordMsg.type} msg={passwordMsg.text} />}

            <Field label="Current Password">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  required
                  placeholder="Enter your current password"
                  className={`${inputCls} pr-10`}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Icon d={showPw ? IC.eyeOff : IC.eye} className="w-4 h-4" />
                </button>
              </div>
            </Field>

            <Field label="New Password" hint="At least 8 characters.">
              <input
                type={showPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                required
                minLength={8}
                placeholder="New password"
                className={inputCls}
              />
            </Field>

            <Field label="Confirm New Password">
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                placeholder="Repeat new password"
                className={`${inputCls} ${confirmPw && confirmPw !== newPw ? 'ring-2 ring-red-400 border-red-300' : ''}`}
              />
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
              )}
            </Field>

            {/* Password strength indicator */}
            {newPw && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[
                    newPw.length >= 8,
                    /[A-Z]/.test(newPw),
                    /[0-9]/.test(newPw),
                    /[^A-Za-z0-9]/.test(newPw),
                  ].map((met, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${met ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {[
                    !(/[A-Z]/.test(newPw)) && 'uppercase letter',
                    !(/[0-9]/.test(newPw)) && 'number',
                    !(/[^A-Za-z0-9]/.test(newPw)) && 'symbol',
                  ].filter(Boolean).length === 0
                    ? '✓ Strong password'
                    : `Add: ${[!(/[A-Z]/.test(newPw)) && 'uppercase', !(/[0-9]/.test(newPw)) && 'number', !(/[^A-Za-z0-9]/.test(newPw)) && 'symbol'].filter(Boolean).join(', ')}`
                  }
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={updateProfile.isPending || (!!confirmPw && confirmPw !== newPw)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-md"
              >
                {updateProfile.isPending
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Changing…</>
                  : <><Icon d={IC.lock} className="w-3.5 h-3.5" />Change Password</>
                }
              </button>
            </div>
          </Section>
        </form>
      )}

      {/* ── Security Tab (SUPER_ADMIN only) ─────────────────────────────────── */}
      {tab === 'security' && can('SUPER_ADMIN') && (
        <form onSubmit={handleSecuritySave}>
          <Section title="JWT Security Settings" desc="Controls how authentication tokens are signed. Changing these will invalidate all active sessions." icon={IC.shield}>

            {/* Warning banner */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
              <Icon d={IC.warn} className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-bold mb-0.5">Important — read before changing</p>
                <p>Updating the JWT Secret will immediately invalidate all active login sessions, including yours. Every user will need to log in again. Only change this if you need to rotate credentials for security reasons.</p>
              </div>
            </div>

            {securityMsg && <Alert type={securityMsg.type} msg={securityMsg.text} />}

            <Field
              label="JWT Secret"
              hint="Leave blank to keep the current secret. Minimum 16 characters. Use a long random string."
            >
              <div className="relative">
                <Icon d={IC.key} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={jwtSecret}
                  onChange={e => setJwtSecret(e.target.value)}
                  placeholder="Enter new secret (leave blank to keep current)"
                  minLength={16}
                  className={`${inputCls} pl-9 pr-24 font-mono`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" onClick={() => setShowSecret(v => !v)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors">
                    <Icon d={showSecret ? IC.eyeOff : IC.eye} className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Generate a random secret"
                    onClick={() => {
                      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                      const arr = crypto.getRandomValues(new Uint8Array(48));
                      setJwtSecret(Array.from(arr).map(b => chars[b % chars.length]).join(''));
                      setShowSecret(true);
                    }}
                    className="text-[#6C63FF] hover:text-[#5a52e0] p-1 rounded-lg transition-colors"
                  >
                    <Icon d={IC.refresh} className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {jwtSecret && jwtSecret.length < 16 && (
                <p className="text-xs text-red-500 mt-1">Secret must be at least 16 characters.</p>
              )}
            </Field>

            <Field
              label="Token Expiry"
              hint="How long a login session stays valid before the user must log in again."
            >
              <div className="relative">
                <Icon d={IC.clock} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={jwtExpiresIn}
                  onChange={e => setJwtExpiresIn(e.target.value)}
                  className={`${inputCls} pl-9 appearance-none`}
                >
                  <option value="1d">1 day</option>
                  <option value="3d">3 days</option>
                  <option value="7d">7 days (recommended)</option>
                  <option value="14d">14 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                </select>
              </div>
            </Field>

            {/* Current values info */}
            <div className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Icon d={IC.info} className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500">
                Current values are stored in <code className="font-mono bg-gray-200 px-1 py-0.5 rounded text-gray-700">backend/.env</code>.
                Changes take effect immediately without restarting the server.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={updateSecurity.isPending || (!!jwtSecret && jwtSecret.length < 16)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-md"
              >
                {updateSecurity.isPending
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving…</>
                  : <><Icon d={IC.shield} className="w-3.5 h-3.5" />Save Security Settings</>
                }
              </button>
            </div>
          </Section>
        </form>
      )}
    </div>
  );
}
