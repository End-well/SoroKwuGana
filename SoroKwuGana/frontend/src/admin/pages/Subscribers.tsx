import { useState } from 'react';
import { useSubscribers, useDeleteSubscriber, useNewsletterStats, useNewsletterChart } from '../hooks/useStats';
import { api } from '../lib/api';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  users:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  check:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  prev:    'M15 19l-7-7 7-7',
  next:    'M9 5l7 7-7 7',
  export:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  warn:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
};

// ── Newsletter Send Chart ─────────────────────────────────────────────────────
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

function SendChart() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { data, isLoading } = useNewsletterChart(period);

  const points: { label: string; emails: number; sends: number }[] = data?.points ?? [];
  const maxEmails = Math.max(...points.map(p => p.emails), 1);

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'daily',   label: 'Daily' },
    { key: 'weekly',  label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly',  label: 'Yearly' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-black text-gray-900">Newsletter Sends</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {data?.totalSent ?? 0} emails sent across {data?.totalSends ?? 0} campaigns
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                period === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="h-40 flex items-end gap-1 animate-pulse">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        ) : points.every(p => p.emails === 0) ? (
          <div className="h-40 flex flex-col items-center justify-center text-center">
            <Icon d={IC.mail} className="w-8 h-8 text-gray-200 mb-2" />
            <p className="text-sm font-semibold text-gray-400">No newsletters sent yet</p>
            <p className="text-xs text-gray-400 mt-1">Send a post to subscribers from the Posts page</p>
          </div>
        ) : (
          <>
            {/* Bar chart — fixed height container, bars grow from bottom */}
            <div className="relative h-40 flex items-end gap-1">
              {points.map((p, i) => {
                const heightPct = maxEmails > 0 ? Math.max((p.emails / maxEmails) * 100, p.emails > 0 ? 4 : 0) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      <div className="bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1 text-center shadow-lg">
                        <div className="font-bold">{p.emails} emails</div>
                        <div className="text-gray-400">{p.sends} send{p.sends !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${p.emails > 0 ? 'bg-gray-800 hover:bg-[#6C63FF]' : 'bg-gray-100'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels — show every 3rd to avoid crowding */}
            <div className="flex gap-1 mt-1.5">
              {points.map((p, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % Math.max(1, Math.floor(points.length / 8)) === 0 && (
                    <span className="text-[9px] text-gray-400 truncate block">{p.label}</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── SMTP status banner ────────────────────────────────────────────────────────
function SmtpStatusBanner() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [msg, setMsg]       = useState('');

  const testSmtp = async () => {
    setStatus('testing');
    setMsg('');
    try {
      const res = await api.post('/newsletter/test-smtp');
      setStatus('ok');
      setMsg(res.data.message);
    } catch (err: unknown) {
      setStatus('fail');
      const data = (err as { response?: { data?: { message?: string; hint?: string } } })?.response?.data;
      setMsg(data?.hint ?? data?.message ?? 'SMTP test failed.');
    }
  };

  if (status === 'ok') {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
        <Icon d={IC.check} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-800 font-semibold">{msg}</p>
      </div>
    );
  }

  if (status === 'fail') {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
        <Icon d={IC.warn} className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-red-800">
          <p className="font-bold mb-1">SMTP connection failed</p>
          <p>{msg}</p>
          <p className="mt-1.5 font-semibold">
            Fix: Add <code className="bg-red-100 px-1 rounded font-mono">SMTP_USER</code> and <code className="bg-red-100 px-1 rounded font-mono">SMTP_PASS</code> to <code className="bg-red-100 px-1 rounded font-mono">backend/.env</code>.
            For Gmail, use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline text-red-700">App Password</a>.
          </p>
        </div>
        <button onClick={testSmtp} className="flex-shrink-0 text-xs font-bold text-red-600 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
      <Icon d={IC.warn} className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-xs text-amber-800">
        <p className="font-bold mb-0.5">Email sending requires SMTP setup</p>
        <p>
          Add <code className="bg-amber-100 px-1 rounded font-mono">SMTP_USER</code> and <code className="bg-amber-100 px-1 rounded font-mono">SMTP_PASS</code> to <code className="bg-amber-100 px-1 rounded font-mono">backend/.env</code>.
          For Gmail use an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="font-bold underline">App Password</a>.
        </p>
      </div>
      <button
        onClick={testSmtp}
        disabled={status === 'testing'}
        className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {status === 'testing'
          ? <span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin" />
          : <Icon d={IC.refresh} className="w-3 h-3" />
        }
        Test SMTP
      </button>
    </div>
  );
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function Subscribers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage]     = useState(1);

  const { data: stats } = useNewsletterStats();
  const { data, isLoading } = useSubscribers({
    page,
    active: filter === 'all' ? undefined : filter === 'active' ? 'true' : 'false',
    search: search || undefined,
  });
  const deleteSubscriber = useDeleteSubscriber();

  const subscribers = data?.subscribers ?? [];
  const total: number = data?.total ?? 0;
  const pages: number = data?.pages ?? 1;

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove "${email}" from the subscriber list?`)) return;
    deleteSubscriber.mutate(id);
  };

  // CSV export
  const handleExport = () => {
    const rows = subscribers.map((s: { email: string; name?: string; active: boolean; subscribedAt: string }) =>
      `"${s.email}","${s.name ?? ''}","${s.active ? 'active' : 'inactive'}","${new Date(s.subscribedAt).toLocaleDateString()}"`
    );
    const csv = ['Email,Name,Status,Subscribed', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your newsletter mailing list.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={!subscribers.length}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
        >
          <Icon d={IC.export} className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: stats?.total    ?? '—', color: 'bg-violet-500', icon: IC.users },
          { label: 'Active',   value: stats?.active   ?? '—', color: 'bg-emerald-500', icon: IC.check },
          { label: 'Inactive', value: stats?.inactive ?? '—', color: 'bg-gray-400', icon: IC.mail },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon d={icon} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Email config notice */}
      <SmtpStatusBanner />

      {/* Send activity chart */}
      <SendChart />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg capitalize transition-all ${filter === f ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Subscribed</th>
              <th className="px-5 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-48" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-5 py-4" />
                </tr>
              ))
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Icon d={IC.mail} className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No subscribers found.</p>
                </td>
              </tr>
            ) : subscribers.map((sub: { _id: string; email: string; name?: string; active: boolean; subscribedAt: string }) => (
              <tr key={sub._id} className="hover:bg-gray-50/70 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF]/20 to-[#FF4D6D]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-[#6C63FF]">{sub.email[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{sub.email}</p>
                      {sub.name && <p className="text-xs text-gray-400">{sub.name}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sub.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {sub.active ? 'Active' : 'Unsubscribed'}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">{timeAgo(sub.subscribedAt)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(sub._id, sub.email)}
                    className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Icon d={IC.trash} className="w-3 h-3" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{subscribers.length}</span> of{' '}
            <span className="font-semibold text-gray-700">{total}</span> subscribers
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 transition-colors">
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 font-medium">Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 transition-colors">
              <Icon d={IC.next} className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
