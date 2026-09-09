import { useState } from 'react';

type FilterTab = 'pending' | 'approved' | 'all';

export default function Comments() {
  const [tab, setTab] = useState<FilterTab>('pending');
  const [search, setSearch] = useState('');

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'pending',  label: 'Pending',  count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'all',      label: 'All',      count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Comments</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Moderate reader comments before they go live.</p>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-[#6C63FF]/10 text-[#6C63FF]' : 'bg-gray-200 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="search" placeholder="Search comments…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent w-56"
          />
        </div>
      </div>

      {/* Comments list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Empty state */}
        <div className="py-20 text-center">
          <p className="text-5xl mb-3">💬</p>
          <p className="text-gray-500 font-medium">
            {tab === 'pending' ? 'No comments awaiting review.' : `No ${tab} comments.`}
          </p>
          <p className="text-gray-400 text-xs mt-1">Comments left by readers will appear here.</p>
        </div>
      </div>

      {/* Bulk actions bar — shown when items are selected */}
      <div className="hidden items-center gap-3 bg-[#6C63FF]/5 border border-[#6C63FF]/20 rounded-2xl px-5 py-3">
        <span className="text-sm font-semibold text-[#6C63FF]">0 selected</span>
        <div className="flex gap-2 ml-auto">
          <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
            ✓ Approve all
          </button>
          <button className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors">
            🗑 Delete all
          </button>
        </div>
      </div>
    </div>
  );
}
