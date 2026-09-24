import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useStats';
import type { Category } from '../types';

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  plus:    'M12 4v16m8-8H4',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  close:   'M6 18L18 6M6 6l12 12',
  post:    'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
  link:    'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const SECTIONS = ['entertainment', 'lifestyle'];

const SECTION_META: Record<string, { dot: string; badge: string; label: string }> = {
  entertainment: { dot: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', label: 'Entertainment' },
  lifestyle:     { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Lifestyle' },
};

const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Category | null>(null);
  const [name, setName]         = useState('');
  const [slug, setSlug]         = useState('');
  const [parent, setParent]     = useState('entertainment');
  const [desc, setDesc]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const resetForm = () => {
    setEditing(null); setName(''); setSlug(''); setParent('entertainment'); setDesc(''); setError('');
  };

  const openNew = () => { resetForm(); setShowForm(true); };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParent(cat.parent ?? 'entertainment');
    setDesc(cat.description ?? '');
    setError('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        await updateCategory.mutateAsync({ id: editing._id, data: { name, slug, parent, description: desc || undefined } });
      } else {
        await createCategory.mutateAsync({ name, slug, parent, description: desc || undefined } as Category);
      }
      resetForm();
      setShowForm(false);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"?\n\nPosts in this category will lose their category assignment.`)) return;
    setDeleting(cat._id);
    try { await deleteCategory.mutateAsync(cat._id); }
    finally { setDeleting(null); }
  };

  const grouped = (s: string) => categories.filter(c => c.parent === s);
  const totalPosts = categories.reduce((sum, c) => sum + (c._count?.posts ?? 0), 0);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length} categories · {totalPosts} published posts
          </p>
        </div>
        <button
          onClick={showForm && !editing ? () => { setShowForm(false); resetForm(); } : openNew}
          className={`inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm ${
            showForm && !editing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white hover:opacity-90 shadow-md'
          }`}
        >
          <Icon d={showForm && !editing ? IC.close : IC.plus} className="w-4 h-4" />
          {showForm && !editing ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${editing ? 'bg-amber-50' : 'bg-[#6C63FF]/5'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${editing ? 'bg-amber-100' : 'bg-[#6C63FF]/15'}`}>
              <Icon d={editing ? IC.edit : IC.plus} className={`w-4 h-4 ${editing ? 'text-amber-700' : 'text-[#6C63FF]'}`} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">{editing ? `Editing: ${editing.name}` : 'New Category'}</h2>
              <p className="text-xs text-gray-500">{editing ? 'Update the details below.' : 'Fill in the details to create a new category.'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Field label="Name" required>
                <input value={name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Sports" className={inputCls} />
              </Field>
              <Field label="Slug" required>
                <input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="e.g. sports" className={`${inputCls} font-mono`} />
              </Field>
              <Field label="Section" required>
                <select value={parent} onChange={e => setParent(e.target.value)} className={inputCls}>
                  {SECTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description">
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional short description" className={inputCls} />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-[#6C63FF] hover:bg-[#5a52e0] disabled:opacity-60 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving…' : editing ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-2.5 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tables by section */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-12 bg-gray-100 rounded-xl mb-2" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        SECTIONS.map(section => {
          const cats = grouped(section);
          const meta = SECTION_META[section];
          const sectionPostCount = cats.reduce((s, c) => s + (c._count?.posts ?? 0), 0);

          return (
            <div key={section} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
                  <span className="text-sm font-black text-gray-800">{meta.label}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.badge}`}>
                    {cats.length} {cats.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-medium hidden sm:block">
                  {sectionPostCount} posts total
                </span>
              </div>

              {cats.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-3">
                    <Icon d={IC.post} className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No {section} categories yet.</p>
                  <button onClick={openNew}
                    className="mt-2 text-xs text-[#6C63FF] font-semibold hover:underline">
                    Add one →
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider hidden md:table-cell">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Posts</th>
                      <th className="px-5 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cats.map(cat => (
                      <tr key={cat._id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Name */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                            <span className="font-semibold text-gray-900">{cat.name}</span>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg font-mono">
                            {cat.slug}
                          </code>
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {cat.description
                            ? <span className="text-xs text-gray-500 truncate max-w-[180px] block">{cat.description}</span>
                            : <span className="text-xs text-gray-300 italic">—</span>
                          }
                        </td>

                        {/* Post count — clickable link to Posts filtered by category */}
                        <td className="px-4 py-3.5">
                          <Link
                            to={`/admin/posts?category=${cat.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#6C63FF] transition-colors"
                          >
                            <Icon d={IC.post} className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-bold">{cat._count?.posts ?? 0}</span>
                            <span className="hidden sm:inline text-gray-400">posts</span>
                          </Link>
                        </td>

                        {/* Actions — always visible */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {/* View posts */}
                            <Link
                              to={`/admin/posts?category=${cat.slug}`}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                              title={`View ${cat.name} posts`}
                            >
                              <Icon d={IC.eye} className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit */}
                            <button
                              onClick={() => openEdit(cat)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-colors"
                              title={`Edit ${cat.name}`}
                            >
                              <Icon d={IC.edit} className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(cat)}
                              disabled={deleting === cat._id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40"
                              title={`Delete ${cat.name}`}
                            >
                              {deleting === cat._id
                                ? <span className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin block" />
                                : <Icon d={IC.trash} className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })
      )}

      {/* Info note */}
      {!isLoading && categories.length > 0 && (
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <Icon d={IC.info} className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Deleting a category does not delete its posts — they will simply lose their category assignment.
            Use the <strong>eye icon</strong> to view all posts in a category, or click the post count.
          </p>
        </div>
      )}
    </div>
  );
}
