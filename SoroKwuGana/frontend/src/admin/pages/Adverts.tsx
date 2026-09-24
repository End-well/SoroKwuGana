import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  check:   'M5 13l4 4L19 7',
  ban:     'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  money:   'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  close:   'M6 18L18 6M6 6l12 12',
  prev:    'M15 19l-7-7 7-7',
  next:    'M9 5l7 7-7 7',
  mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  external:'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};

type Status = 'all' | 'pending' | 'approved' | 'rejected' | 'expired';
type Plan   = '1month' | '6months' | '1year';

interface Advert {
  _id: string;
  businessName:  string;
  contactName:   string;
  email:         string;
  phone?:        string;
  website?:      string;
  adTitle:       string;
  adDescription: string;
  adImageUrl?:   string;
  adLinkUrl?:    string;
  plan:          Plan;
  amount:        number;
  status:        Exclude<Status, 'all'>;
  adminNotes?:   string;
  startDate?:    string;
  endDate?:      string;
  impressions:   number;
  clicks:        number;
  createdAt:     string;
}

const PLAN_LABELS: Record<Plan, string> = {
  '1month':  '1 Month',
  '6months': '6 Months',
  '1year':   '1 Year',
};

const STATUS_STYLES: Record<Exclude<Status, 'all'>, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  expired:  'bg-gray-100 text-gray-500',
};

function formatNGN(n: number) { return `₦${n.toLocaleString('en-NG')}`; }
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// ── Detail drawer ─────────────────────────────────────────────────────────────
function AdvertDrawer({ advert, onClose }: { advert: Advert; onClose: () => void }) {
  const qc = useQueryClient();
  const [notes, setNotes]       = useState(advert.adminNotes ?? '');
  const [startDate, setStart]   = useState(
    advert.startDate ? advert.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const patch = async (status?: string) => {
    setSaving(true); setMsg('');
    try {
      await api.patch(`/adverts/${advert._id}`, {
        ...(status ? { status } : {}),
        adminNotes: notes,
        startDate:  status === 'approved' ? startDate : undefined,
      });
      setMsg(status ? `Advert ${status}!` : 'Notes saved!');
      qc.invalidateQueries({ queryKey: ['adverts'] });
      qc.invalidateQueries({ queryKey: ['advert-stats'] });
      setTimeout(onClose, 700);
    } catch {
      setMsg('Failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-black text-gray-900">Advert Details</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Icon d={IC.close} className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[advert.status]}`}>
              {advert.status}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(advert.createdAt)}</span>
          </div>

          {/* Ad preview */}
          {advert.adImageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 h-36">
              <img src={advert.adImageUrl} alt="Ad" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="font-black text-gray-900 mb-1">{advert.adTitle}</p>
            <p className="text-sm text-gray-500">{advert.adDescription}</p>
            {advert.adLinkUrl && (
              <a href={advert.adLinkUrl} target="_blank" rel="noopener noreferrer"
                className="mt-2 text-xs text-[#6C63FF] flex items-center gap-1 hover:underline">
                <Icon d={IC.external} className="w-3 h-3" />
                {advert.adLinkUrl}
              </a>
            )}
          </div>

          {/* Business info */}
          <div className="space-y-2 text-sm">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Advertiser</p>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-400">Business:</span><br /><span className="font-semibold text-gray-800">{advert.businessName}</span></div>
              <div><span className="text-gray-400">Contact:</span><br /><span className="font-semibold text-gray-800">{advert.contactName}</span></div>
              <div><span className="text-gray-400">Email:</span><br />
                <a href={`mailto:${advert.email}`} className="font-semibold text-[#6C63FF] hover:underline">{advert.email}</a>
              </div>
              {advert.phone && <div><span className="text-gray-400">Phone:</span><br /><span className="font-semibold text-gray-800">{advert.phone}</span></div>}
              {advert.website && <div className="col-span-2"><span className="text-gray-400">Website:</span><br />
                <a href={advert.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#6C63FF] hover:underline">{advert.website}</a>
              </div>}
            </div>
          </div>

          {/* Plan & stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Plan',   value: PLAN_LABELS[advert.plan] },
              { label: 'Amount', value: formatNGN(advert.amount) },
              { label: 'Clicks', value: String(advert.clicks) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="font-black text-gray-900 text-sm">{value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Dates */}
          {(advert.startDate || advert.endDate) && (
            <div className="text-sm text-gray-500 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              Active: <strong className="text-emerald-700">{formatDate(advert.startDate)}</strong> → <strong className="text-emerald-700">{formatDate(advert.endDate)}</strong>
            </div>
          )}

          {/* Approve start date */}
          {advert.status === 'pending' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Start Date (on approval)</label>
              <input type="date" value={startDate} onChange={e => setStart(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Internal notes (not visible to advertiser)…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none" />
          </div>

          {msg && <p className="text-sm font-semibold text-center text-[#6C63FF]">{msg}</p>}
        </div>

        {/* Actions footer */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-2 sticky bottom-0 bg-white">
          {advert.status === 'pending' && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => patch('approved')} disabled={saving}
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
                <Icon d={IC.check} className="w-4 h-4" />
                Approve
              </button>
              <button onClick={() => patch('rejected')} disabled={saving}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
                <Icon d={IC.ban} className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
          {advert.status === 'approved' && (
            <button onClick={() => patch('expired')} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
              Mark as Expired
            </button>
          )}
          <button onClick={() => patch()} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Icon d={IC.edit} className="w-4 h-4" />}
            Save Notes
          </button>
          {/* Message button */}
          <a
            href={`/admin/adverts/${advert._id}/messages`}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm py-2.5 rounded-xl transition-colors"
          >
            <Icon d={IC.mail} className="w-4 h-4" />
            Open Conversation
          </a>
          <button onClick={() => {
            if (confirm(`Delete advert from ${advert.businessName}? This cannot be undone.`)) {
              api.delete(`/adverts/${advert._id}`).then(() => {
                qc.invalidateQueries({ queryKey: ['adverts'] });
                qc.invalidateQueries({ queryKey: ['advert-stats'] });
                onClose();
              });
            }
          }}
            className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold text-sm py-2 rounded-xl transition-colors">
            <Icon d={IC.trash} className="w-4 h-4" />
            Delete Advert
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Payment Settings Panel ────────────────────────────────────────────────────
function PaymentSettingsPanel() {
  const qc = useQueryClient();
  const [open, setOpen]           = useState(false);
  const [bankName, setBankName]   = useState('');
  const [accountName, setAccName] = useState('');
  const [accountNumber, setAccNo] = useState('');
  const [bankCode, setBankCode]   = useState('');
  const [info, setInfo]           = useState('');
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  const { data: settings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: () => api.get('/adverts/payment-settings').then(r => r.data),
    staleTime: 60_000,
  });

  // Pre-fill when data loads
  useEffect(() => {
    if (settings) {
      setBankName(settings.bankName ?? '');
      setAccName(settings.accountName ?? '');
      setAccNo(settings.accountNumber ?? '');
      setBankCode(settings.bankCode ?? '');
      setInfo(settings.additionalInfo ?? '');
    }
  }, [settings]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.put('/adverts/payment-settings', { bankName, accountName: accountName, accountNumber: accountNumber, bankCode, additionalInfo: info });
      qc.invalidateQueries({ queryKey: ['payment-settings'] });
      setMsg('Payment details saved!');
      setOpen(false);
    } catch { setMsg('Failed to save.'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
        <div>
          <p className="text-sm font-black text-gray-900 flex items-center gap-2">🏦 Payment Receiving Details</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {settings?.accountNumber
              ? `${settings.bankName} — ${settings.accountNumber}`
              : 'Not configured — advertisers will not see payment details until set.'}
          </p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <form onSubmit={save} className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          {msg && <p className="text-xs font-semibold text-[#6C63FF]">{msg}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Bank Name *</label>
              <input value={bankName} onChange={e => setBankName(e.target.value)} required placeholder="e.g. GTBank" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Account Name *</label>
              <input value={accountName} onChange={e => setAccName(e.target.value)} required placeholder="e.g. SoroKwuGana Ltd" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Account Number *</label>
              <input value={accountNumber} onChange={e => setAccNo(e.target.value)} required placeholder="10-digit account number" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Sort Code / Bank Code</label>
              <input value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Additional Instructions</label>
            <textarea value={info} onChange={e => setInfo(e.target.value)} rows={2} placeholder="e.g. Send proof of payment after transfer" className={`${inputCls} resize-none`} />
          </div>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Save Payment Details'}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Main Adverts page ─────────────────────────────────────────────────────────
export default function Adverts() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<Status>('all');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState<Advert | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['advert-stats'],
    queryFn:  () => api.get('/adverts/stats').then(r => r.data),
    staleTime: 30_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['adverts', { status, search, page }],
    queryFn:  () => api.get('/adverts', { params: {
      status: status === 'all' ? undefined : status,
      search: search || undefined,
      page,
    }}).then(r => r.data),
    staleTime: 15_000,
  });

  const adverts: Advert[] = data?.adverts ?? [];
  const total: number     = data?.total ?? 0;
  const pages: number     = data?.pages ?? 1;

  const TABS: { key: Status; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'expired',  label: 'Expired' },
  ];

  return (
    <div className="space-y-6">
      {selected && <AdvertDrawer advert={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Adverts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage advertiser requests and campaigns.</p>
        </div>
        <a href="/advertise" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <Icon d={IC.external} className="w-4 h-4" />
          View Public Page
        </a>
      </div>

      {/* Payment Settings */}
      <PaymentSettingsPanel />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total',    value: stats?.total    ?? '—', icon: IC.eye   },
          { label: 'Pending',  value: stats?.pending  ?? '—', icon: IC.mail  },
          { label: 'Approved', value: stats?.approved ?? '—', icon: IC.check },
          { label: 'Rejected', value: stats?.rejected ?? '—', icon: IC.ban   },
          { label: 'Revenue',  value: stats?.revenue != null ? formatNGN(stats.revenue) : '—', icon: IC.money },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon d={icon} className="w-4 h-4 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-gray-900 leading-none truncate">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Icon d={IC.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Search by business, email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize ${
                status === t.key ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {t.label}
              {t.key !== 'all' && stats?.[t.key] > 0 && (
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${t.key === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stats[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Business</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Plan</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Amount</th>
              <th className="px-4 py-3.5 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
              <th className="px-5 py-3.5 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4"><div className="h-4 bg-gray-100 rounded w-40 mb-1" /><div className="h-3 bg-gray-50 rounded w-28" /></td>
                  <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="px-4 py-4 hidden sm:table-cell"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-20" /></td>
                  <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-100 rounded w-16" /></td>
                  <td className="px-5 py-4" />
                </tr>
              ))
            ) : adverts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Icon d={IC.money} className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No adverts found.</p>
                </td>
              </tr>
            ) : adverts.map(advert => (
              <tr key={advert._id} className="hover:bg-gray-50/70 transition-colors group cursor-pointer" onClick={() => setSelected(advert)}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900 group-hover:text-[#6C63FF] transition-colors">{advert.businessName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{advert.email}</p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    {PLAN_LABELS[advert.plan]}
                  </span>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[advert.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      advert.status === 'approved' ? 'bg-emerald-500' :
                      advert.status === 'pending'  ? 'bg-amber-500' :
                      advert.status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    {advert.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-700 hidden lg:table-cell">{formatNGN(advert.amount)}</td>
                <td className="px-4 py-4 text-xs text-gray-400 hidden lg:table-cell">{timeAgo(advert.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(advert); }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Icon d={IC.eye} className="w-3 h-3" />
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{adverts.length}</span> of <span className="font-semibold text-gray-700">{total}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:border-[#6C63FF] hover:text-[#6C63FF] disabled:opacity-30 transition-colors">
              <Icon d={IC.prev} className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pages}</span>
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
