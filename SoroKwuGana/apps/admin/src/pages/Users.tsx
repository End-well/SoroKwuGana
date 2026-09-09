import { useState } from 'react';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'AUTHOR';

const roleConfig: Record<Role, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'bg-[#6C63FF]/10 text-[#6C63FF]' },
  ADMIN:       { label: 'Admin',       color: 'bg-rose-100 text-rose-700' },
  AUTHOR:      { label: 'Author',      color: 'bg-emerald-100 text-emerald-700' },
};

export default function Users() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Manage authors, admins and super admins.</p>
        </div>
        <button
          onClick={() => setShowInvite(v => !v)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
          {showInvite ? '✕ Cancel' : '＋ Invite User'}
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 mb-5">Invite New User</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
              <input type="text" placeholder="e.g. Ngozi Eze"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email *</label>
              <input type="email" placeholder="ngozi@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Role *</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
                <option value="AUTHOR">Author</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
              Send Invite
            </button>
            <button onClick={() => setShowInvite(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2.5 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="search" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['ALL', 'SUPER_ADMIN', 'ADMIN', 'AUTHOR'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${roleFilter === r ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r === 'ALL' ? 'All' : r === 'SUPER_ADMIN' ? 'Super Admin' : r.charAt(0) + r.slice(1).toLowerCase()}
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
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Posts</th>
              <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <p className="text-4xl mb-3">👥</p>
                <p className="text-gray-500 font-medium">No users found.</p>
                <p className="text-gray-400 text-xs mt-1">
                  {search ? 'Try a different search.' : 'Invite someone to get started.'}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(roleConfig) as [Role, typeof roleConfig[Role]][]).map(([key, val]) => (
          <span key={key} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${val.color}`}>
            {val.label}
          </span>
        ))}
        <span className="text-xs text-gray-400 self-center">— Role permissions increase from Author → Admin → Super Admin</span>
      </div>
    </div>
  );
}
