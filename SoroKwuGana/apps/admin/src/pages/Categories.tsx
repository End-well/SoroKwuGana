import { useState } from 'react';

const parentSections = ['entertainment', 'lifestyle'];

const defaultCategories = [
  { name: 'Movies',    slug: 'movies',    parent: 'entertainment', posts: 0 },
  { name: 'TV Shows',  slug: 'tv-shows',  parent: 'entertainment', posts: 0 },
  { name: 'Music',     slug: 'music',     parent: 'entertainment', posts: 0 },
  { name: 'Celebrity', slug: 'celebrity', parent: 'entertainment', posts: 0 },
  { name: 'Fashion',   slug: 'fashion',   parent: 'lifestyle',     posts: 0 },
  { name: 'Beauty',    slug: 'beauty',    parent: 'lifestyle',     posts: 0 },
  { name: 'Health',    slug: 'health',    parent: 'lifestyle',     posts: 0 },
  { name: 'Travel',    slug: 'travel',    parent: 'lifestyle',     posts: 0 },
  { name: 'Food',      slug: 'food',      parent: 'lifestyle',     posts: 0 },
];

const parentColor: Record<string, string> = {
  entertainment: 'bg-violet-100 text-violet-700',
  lifestyle:     'bg-emerald-100 text-emerald-700',
};

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parent, setParent] = useState('entertainment');
  const [description, setDescription] = useState('');

  const handleNameChange = (v: string) => {
    setName(v);
    setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Organise content into topics and sections.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
          {showForm ? '✕ Cancel' : '＋ Add Category'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 mb-5">New Category</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name *</label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Sports"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Slug *</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. sports"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Section *</label>
              <select value={parent} onChange={e => setParent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
                {parentSections.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
              Save Category
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2.5 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entertainment */}
      {parentSections.map(section => (
        <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${parentColor[section]}`}>
                {section}
              </span>
              <span className="text-xs text-gray-400">
                {defaultCategories.filter(c => c.parent === section).length} categories
              </span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Posts</th>
                <th className="px-6 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {defaultCategories.filter(c => c.parent === section).map(cat => (
                <tr key={cat.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                  <td className="px-4 py-4 font-mono text-xs text-gray-400 hidden sm:table-cell">{cat.slug}</td>
                  <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{cat.posts}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a52e0] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#6C63FF]/10">
                        Edit
                      </button>
                      <button className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
