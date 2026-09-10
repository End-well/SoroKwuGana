import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser } from '../hooks/useStats';
import { useAuth } from '../context/AuthContext';
import type { AdminUser } from '../types';

type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'AUTHOR';

const roleConfig: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-[#6C63FF]/10 text-[#6C63FF]' },
  ADMIN:       { label: 'Admin',       color: 'bg-rose-100 text-rose-700' },
  AUTHOR:      { label: 'Author',      color: 'bg-emerald-100 text-emerald-700' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState<RoleFilter>('ALL');
  const [page, setPage]         = useState(1);

  // Form state
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRoleField]    = useState<'AUTHOR' | 'ADMIN' | 'SUPER_ADMIN'>('AUTHOR');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      await createUser.mutateAsync({ name, email, password, role });
      setShowForm(false); setName(''); setEmail(''); setPassword(''); setRoleField('AUTHOR');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (user.id === currentUser?.id) { alert("You can't delete your own account."); return; }
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    deleteUser.mutate(user.id ?? user._id ?? '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Manage authors, admins and super admins.</p>
        </div>
        {(currentUser?.role === 'SUPER_ADMIN') && (
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
            {showForm ? '✕ Cancel' : '＋ Add User'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 mb-5">New User</h2>
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Ngozi Eze"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ngozi@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 8 characters" minLength={8}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role *</label>
              <select value={role} onChange={e => setRoleField(e.target.value as typeof role)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
                <option value="AUTHOR">Author</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                {saving ? 'Creating…' : 'Create User'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="search" placeholder="Search users…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['ALL', 'SUPER_ADMIN', 'ADMIN', 'AUTHOR'] as RoleFilter[]).map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${roleFilter === r ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === 'ALL' ? 'All' : roleConfig[r]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                  <td className="px-6 py-4" />
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">No users found.</td></tr>
            ) : users.map(user => (
              <tr key={user._id ?? user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleConfig[user.role]?.color ?? ''}`}>
                    {roleConfig[user.role]?.label ?? user.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  {(user.id ?? user._id) !== currentUser?.id && (
                    <button onClick={() => handleDelete(user)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {users.length} of {total} users</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
            <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {Object.entries(roleConfig).map(([key, val]) => (
          <span key={key} className={`font-semibold px-3 py-1.5 rounded-full ${val.color}`}>{val.label}</span>
        ))}
        <span className="self-center">— permissions increase: Author → Admin → Super Admin</span>
      </div>
    </div>
  );
}
