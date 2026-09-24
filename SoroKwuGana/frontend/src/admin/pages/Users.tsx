import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useStats';
import { useAuth } from '../context/AuthContext';
import { ROLE_META, type Role } from '../lib/roles';
import type { AdminUser } from '../types';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  plus:   'M12 4v16m8-8H4',
  trash:  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  close:  'M6 18L18 6M6 6l12 12',
  user:   'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  info:   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  prev:   'M15 19l-7-7 7-7',
  next:   'M9 5l7 7-7 7',
  lock:   'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
};

type RoleFilter = 'ALL' | Role;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all';

interface FieldProps { label: string; required?: boolean; children: React.ReactNode; }
function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Users() {
  const { user: currentUser, can } = useAuth();

  // Guard — only SUPER_ADMIN can access this page
  if (!can('SUPER_ADMIN')) return <Navigate to="/admin" replace />;

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState<RoleFilter>('ALL');
  const [page, setPage]         = useState(1);

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleField]    = useState<Role>('AUTHOR');
  const [showPw, setShowPw]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const { data, isLoading } = useUsers({
    page,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    search: search || undefined,
  });
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const users: AdminUser[] = data?.users ?? [];
  const total: number      = data?.total ?? 0;
  const pages: number      = data?.pages ?? 1;

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setRoleField('AUTHOR'); setError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await createUser.mutateAsync({ name, email, password, role });
      setShowForm(false);
      resetForm();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if ((user.id ?? user._id) === currentUser?.id) {
      alert("You can't delete your own account.");
      return;
    }
    if (!confirm(`Delete user "${user.name}" (${user.email})?\n\nThis cannot be undone.`)) return;
    deleteUser.mutate(user.id ?? user._id ?? '');
  };

  const ROLE_FILTERS: RoleFilter[] = ['ALL', 'SUPER_ADMIN', 'ADMIN', 'AUTHOR'];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} registered users · Super Admin access only</p>
        </div>
        <button
          onClick={showForm ? () => { setShowForm(false); resetForm(); } : () => setShowForm(true)}
          className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm ${
            showForm
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white hover:opacity-90 shadow-md'
          }`}
        >
          <Icon d={showForm ? IC.close : IC.plus} className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Privilege explanation */}
      <div className="grid sm:grid-cols-3 gap-3">
        {(['AUTHOR', 'ADMIN', 'SUPER_ADMIN'] as Role[]).map(r => {
          const meta = ROLE_META[r];
          return (
            <div key={r} className={`rounded-2xl border p-4 flex items-start gap-3 ${meta.bg}/30 border-current/10`}>
              <div className={`w-8 h-8 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon d={r === 'SUPER_ADMIN' ? IC.shield : r === 'ADMIN' ? IC.lock : IC.user} className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div>
                <p className={`text-sm font-black ${meta.color}`}>{meta.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{meta.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#6C63FF]/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/15 flex items-center justify-center">
              <Icon d={IC.user} className="w-4 h-4 text-[#6C63FF]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">Create New User</h2>
              <p className="text-xs text-gray-500">They will be able to log in immediately.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            {error && (
              <div className="mb-5 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Full Name" required>
                <input value={name} onChange={e => setName(e.target.value)} required
                  placeholder="e.g. Ngozi Eze" className={inputCls} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="ngozi@example.com" className={inputCls} />
              </Field>
              <Field label="Password" required>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className={`${inputCls} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs font-bold">
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Field>
              <Field label="Role" required>
                <select value={role} onChange={e => setRoleField(e.target.value as Role)} className={inputCls}>
                  <option value="AUTHOR">Author — writes posts only</option>
                  <option value="ADMIN">Admin — full content access</option>
                  <option value="SUPER_ADMIN">Super Admin — all access</option>
                </select>
              </Field>
            </div>

            {/* Role preview */}
            <div className={`mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl border ${ROLE_META[role].bg}/40 border-current/10`}>
              <span className={`w-2 h-2 rounded-full ${ROLE_META[role].dot}`} />
              <p className="text-xs text-gray-600">{ROLE_META[role].desc}</p>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {saving ? 'Creating…' : 'Create User'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2.5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search by name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {ROLE_FILTERS.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                roleFilter === r ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {r === 'ALL' ? 'All' : ROLE_META[r as Role]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded-lg w-28 mb-1.5" />
                        <div className="h-3 bg-gray-100 rounded w-36" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded-full w-24" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded-lg w-24" /></td>
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Icon d={IC.user} className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No users found.</p>
                </td>
              </tr>
            ) : users.map(user => {
              const meta = ROLE_META[user.role as Role];
              const isSelf = (user.id ?? user._id) === currentUser?.id;
              return (
                <tr key={user._id ?? user.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-[#6C63FF]/10 text-[#6C63FF] px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-full ${meta?.bg ?? 'bg-gray-100'} ${meta?.color ?? 'text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta?.dot ?? 'bg-gray-400'}`} />
                      {meta?.label ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-right">
                    {!isSelf ? (
                      <button
                        onClick={() => handleDelete(user)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Icon d={IC.trash} className="w-3 h-3" />
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 font-medium">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{users.length}</span> of <span className="font-semibold text-gray-700">{total}</span> users
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 font-medium">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <Icon d={IC.next} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
