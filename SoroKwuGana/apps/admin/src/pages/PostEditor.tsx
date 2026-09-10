import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories, useCreatePost, useUpdatePost, useAdminPost } from '../hooks/useStats';

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit  = !!id;
  const navigate = useNavigate();

  const { data: categories = [] } = useCategories();
  const { data: existingPost }    = useAdminPost(id ?? '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(id ?? '');

  const [title, setTitle]       = useState('');
  const [slug, setSlug]         = useState('');
  const [excerpt, setExcerpt]   = useState('');
  const [content, setContent]   = useState('');
  const [coverImage, setCover]  = useState('');
  const [categoryId, setCategory] = useState('');
  const [tags, setTags]         = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  // Populate form when editing
  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt ?? '');
      setContent(existingPost.content ?? '');
      setCover(existingPost.coverImage ?? '');
      setCategory((existingPost.category as { _id: string })?._id ?? '');
      setTags((existingPost.tags ?? []).map((t: { name: string }) => t.name).join(', '));
      setPublished(existingPost.published);
      setFeatured(existingPost.featured);
    }
  }, [existingPost]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) {
      setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError('Please select a category.'); return; }
    if (!content.trim()) { setError('Content cannot be empty.'); return; }

    setError('');
    setSaving(true);

    const payload = {
      title, slug, excerpt, content,
      coverImage: coverImage || undefined,
      categoryId,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published, featured,
    };

    try {
      if (isEdit) {
        await updatePost.mutateAsync(payload);
      } else {
        await createPost.mutateAsync(payload);
      }
      navigate('/posts');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{isEdit ? 'Update your article.' : 'Write and publish a new article.'}</p>
        </div>
        <button onClick={() => navigate('/posts')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to posts
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Title *</label>
                <input value={title} onChange={e => handleTitleChange(e.target.value)} required
                  placeholder="Article title…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Slug *</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} required
                  placeholder="article-url-slug"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Excerpt</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  placeholder="Short summary shown on listing pages…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent resize-none" />
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Content *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={20}
                placeholder="Write your article content here… (supports plain text for now)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent resize-y font-mono" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900">Publish</h3>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 font-medium">Status</label>
                <button type="button" onClick={() => setPublished(v => !v)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${published ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${published ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400">{published ? '✅ Will be visible on the public site.' : '📋 Saved as draft — not visible to readers.'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <label className="text-sm text-gray-700 font-medium">Featured</label>
                <button type="button" onClick={() => setFeatured(v => !v)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${featured ? 'bg-[#6C63FF]' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${featured ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg mt-2">
                {saving ? 'Saving…' : isEdit ? 'Update Post' : 'Publish Post'}
              </button>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Category *</h3>
              <select value={categoryId} onChange={e => setCategory(e.target.value)} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
                <option value="">Select category…</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Cover image */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Cover Image</h3>
              <input value={coverImage} onChange={e => setCover(e.target.value)}
                placeholder="https://…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
              {coverImage && (
                <img src={coverImage} alt="Cover preview" className="w-full rounded-xl aspect-video object-cover mt-2" />
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Tags</h3>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Afrobeats, Nollywood, Fashion"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
              <p className="text-xs text-gray-400">Separate tags with commas.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
