import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useStats';
import type { Category } from '../types';

const parentSections = ['entertainment', 'lifestyle'];
const parentColor: Record<string, string> = {
  entertainment: 'bg-violet-100 text-violet-700',
  lifestyle:     'bg-emerald-100 text-emerald-700',
};

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Category | null>(null);
  const [name, setName]           = useState('');
  const [slug, setSlug]           = useState('');
  const [parent, setParent]       = useState('entertainment');
  const [description, setDesc]    = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const openNew = () => {
    setEditing(null); setName(''); setSlug(''); setParent('entertainment'); setDesc(''); setError(''); setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat); setName(cat.name); setSlug(cat.slug); setParent(cat.parent ?? 'entertainment'); setDesc(cat.description ?? ''); setError(''); setShowForm(true);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    if (!editing) setSlug(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (editing) {
        await updateCategory.mutateAsync({ id: editing._id, data: { name, slug, parent, description: description || undefined } });
      } else {
        await createCategory.mutateAsync({ name, slug, parent, description: description || undefined } as Category);
      }
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"? Posts in this category will lose their category.`)) return;
    await deleteCategory.mutateAsync(cat._id);
  };

  const grouped = (section: string) => categories.filter(c => c.parent === section);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Organise content into topics and sections.</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">
          {showForm && !editing ? '✕ Cancel' : '＋ Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-black text-gray-900 mb-5">{editing ? `Edit: ${editing.name}` : 'New Category'}</h2>
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">{error}</div>}
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Name *</label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Sports"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Slug *</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. sports"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
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
              <input value={description} onChange={e => setDesc(e.target.value)} placeholder="Optional"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors">
                {saving ? 'Saving…' : editing ? 'Update Category' : 'Save Category'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 font-medium text-sm px-4 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grouped tables */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 animate-pulse">Loading categories…</div>
      ) : (
        parentSections.map(section => (
          <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${parentColor[section]}`}>{section}</span>
                <span className="text-xs text-gray-400">{grouped(section).length} categories</span>
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
                {grouped(section).length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400 text-sm">No categories yet.</td></tr>
                ) : grouped(section).map(cat => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-400 hidden sm:table-cell">{cat.slug}</td>
                    <td className="px-4 py-4 text-gray-500 hidden md:table-cell">{cat._count?.posts ?? 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(cat)}
                          className="text-xs font-semibold text-[#6C63FF] hover:text-[#5a52e0] px-3 py-1.5 rounded-lg hover:bg-[#6C63FF]/10 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(cat)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
