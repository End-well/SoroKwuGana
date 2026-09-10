import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories, useCreatePost, useUpdatePost, useAdminPost } from '../hooks/useStats';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption: string;
  source: string;
}

const emptyMedia = (): MediaItem => ({ url: '', type: 'image', caption: '', source: '' });

// ── Helper: detect video vs image from URL ────────────────────────────────────
function detectMediaType(url: string): 'image' | 'video' {
  const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com', 'twitter.com/i/video', '.mp4', '.webm', '.mov'];
  return videoPatterns.some(p => url.includes(p)) ? 'video' : 'image';
}

// ── Helper: get YouTube embed URL ─────────────────────────────────────────────
function getYouTubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// ── Media Item Row ─────────────────────────────────────────────────────────────
function MediaRow({ item, index, onChange, onRemove }: {
  item: MediaItem;
  index: number;
  onChange: (i: number, updated: MediaItem) => void;
  onRemove: (i: number) => void;
}) {
  const ytEmbed = item.type === 'video' ? getYouTubeEmbed(item.url) : null;

  return (
    <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
          {item.type === 'video' ? '🎬 Video' : '🖼️ Image'} {index + 1}
        </span>
        <button type="button" onClick={() => onRemove(index)}
          className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors">
          Remove
        </button>
      </div>

      {/* URL input */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">URL *</label>
        <div className="flex gap-2">
          <input
            value={item.url}
            onChange={e => {
              const url = e.target.value;
              onChange(index, { ...item, url, type: detectMediaType(url) });
            }}
            placeholder="https://example.com/image.jpg or YouTube URL"
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
          />
          <select
            value={item.type}
            onChange={e => onChange(index, { ...item, type: e.target.value as 'image' | 'video' })}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* Caption + Source */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Caption</label>
          <input value={item.caption} onChange={e => onChange(index, { ...item, caption: e.target.value })}
            placeholder="Optional caption"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Source / Credit</label>
          <input value={item.source} onChange={e => onChange(index, { ...item, source: e.target.value })}
            placeholder="e.g. Getty Images"
            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
        </div>
      </div>

      {/* Preview */}
      {item.url && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          {item.type === 'image' ? (
            <img src={item.url} alt={item.caption || 'preview'}
              className="w-full max-h-48 object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : ytEmbed ? (
            <iframe src={ytEmbed} className="w-full aspect-video" allowFullScreen title="video preview" />
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100">
              <span className="text-2xl">🎬</span>
              <span className="text-xs text-gray-500 truncate">{item.url}</span>
            </div>
          )}
          {(item.caption || item.source) && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {item.caption && <span>{item.caption}</span>}
              {item.caption && item.source && <span className="mx-1">·</span>}
              {item.source && <span className="text-gray-400">© {item.source}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main PostEditor ────────────────────────────────────────────────────────────
export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit  = !!id;
  const navigate = useNavigate();

  const { data: categories = [] }  = useCategories();
  const { data: existingPost }     = useAdminPost(id ?? '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost(id ?? '');

  // Core fields
  const [title, setTitle]         = useState('');
  const [slug, setSlug]           = useState('');
  const [excerpt, setExcerpt]     = useState('');
  const [content, setContent]     = useState('');
  const [categoryId, setCategory] = useState('');
  const [tags, setTags]           = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured]   = useState(false);
  const [breaking, setBreaking]   = useState(false);

  // Media
  const [coverImage, setCover]           = useState('');
  const [referenceImages, setRefImages]  = useState<MediaItem[]>([]);
  const [videos, setVideos]              = useState<MediaItem[]>([]);

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // Populate when editing
  useEffect(() => {
    if (!existingPost) return;
    setTitle(existingPost.title);
    setSlug(existingPost.slug);
    setExcerpt(existingPost.excerpt ?? '');
    setContent(existingPost.content ?? '');
    setCover(existingPost.coverImage ?? '');
    setCategory((existingPost.category as { _id: string })?._id ?? '');
    setTags((existingPost.tags ?? []).map((t: { name: string }) => t.name).join(', '));
    setPublished(existingPost.published);
    setFeatured(existingPost.featured);
    setBreaking((existingPost as { breaking?: boolean }).breaking ?? false);

    const ri = (existingPost as { referenceImages?: MediaItem[] }).referenceImages ?? [];
    const vd = (existingPost as { videos?: MediaItem[] }).videos ?? [];
    setRefImages(ri.map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
    setVideos(vd.map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
  }, [existingPost]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim());
  };

  // Media helpers
  const updateRefImage = (i: number, item: MediaItem) => setRefImages(prev => prev.map((m, idx) => idx === i ? item : m));
  const removeRefImage = (i: number) => setRefImages(prev => prev.filter((_, idx) => idx !== i));
  const updateVideo    = (i: number, item: MediaItem) => setVideos(prev => prev.map((m, idx) => idx === i ? item : m));
  const removeVideo    = (i: number) => setVideos(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError('Please select a category.'); return; }
    if (!content.trim()) { setError('Content cannot be empty.'); return; }

    // Validate media URLs
    const badRef = referenceImages.find(m => m.url && !m.url.startsWith('http'));
    const badVid = videos.find(m => m.url && !m.url.startsWith('http'));
    if (badRef) { setError('All reference image URLs must start with https://'); return; }
    if (badVid) { setError('All video URLs must start with https://'); return; }

    setError(''); setSaving(true);

    const payload = {
      title, slug, excerpt, content,
      coverImage: coverImage || undefined,
      referenceImages: referenceImages.filter(m => m.url),
      videos:          videos.filter(m => m.url),
      categoryId,
      tags:      tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published, featured, breaking,
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
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{isEdit ? 'Update your article.' : 'Write and publish a new article.'}</p>
        </div>
        <button type="button" onClick={() => navigate('/posts')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Back to posts
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title / Slug / Excerpt */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Title *</label>
                <input value={title} onChange={e => handleTitleChange(e.target.value)} required
                  placeholder="Article title…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Slug *</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <span className="px-3 text-xs text-gray-400 border-r border-gray-200 py-2.5 font-mono">/article/</span>
                  <input value={slug} onChange={e => setSlug(e.target.value)} required
                    placeholder="article-url-slug"
                    className="flex-1 bg-transparent px-3 py-2.5 text-gray-900 font-mono text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Excerpt</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  placeholder="Short summary shown in listing pages and social shares…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none" />
              </div>
            </div>

            {/* Body content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Body Content *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={18}
                placeholder="Write your full article here…"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-y" />
              <p className="text-xs text-gray-400 mt-2">{content.trim().split(/\s+/).filter(Boolean).length} words</p>
            </div>

            {/* ── Reference Images ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Reference Images</h3>
                  <p className="text-xs text-gray-400 mt-0.5">In-article images with optional captions and credits.</p>
                </div>
                <button type="button"
                  onClick={() => setRefImages(prev => [...prev, { ...emptyMedia(), type: 'image' }])}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-2 rounded-xl hover:bg-[#6C63FF]/20 transition-colors">
                  ＋ Add Image
                </button>
              </div>

              {referenceImages.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">🖼️</p>
                  <p className="text-sm">No reference images yet.</p>
                  <button type="button" onClick={() => setRefImages([{ ...emptyMedia(), type: 'image' }])}
                    className="mt-3 text-xs text-[#6C63FF] font-semibold hover:underline">
                    Add your first image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {referenceImages.map((item, i) => (
                    <MediaRow key={i} item={item} index={i} onChange={updateRefImage} onRemove={removeRefImage} />
                  ))}
                  <button type="button"
                    onClick={() => setRefImages(prev => [...prev, { ...emptyMedia(), type: 'image' }])}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors">
                    ＋ Add Another Image
                  </button>
                </div>
              )}
            </div>

            {/* ── Videos ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Videos</h3>
                  <p className="text-xs text-gray-400 mt-0.5">YouTube, Vimeo, TikTok or direct video URLs.</p>
                </div>
                <button type="button"
                  onClick={() => setVideos(prev => [...prev, { ...emptyMedia(), type: 'video' }])}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF4D6D] bg-[#FF4D6D]/10 px-3 py-2 rounded-xl hover:bg-[#FF4D6D]/20 transition-colors">
                  ＋ Add Video
                </button>
              </div>

              {videos.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                  <p className="text-3xl mb-2">🎬</p>
                  <p className="text-sm">No videos added yet.</p>
                  <button type="button" onClick={() => setVideos([{ ...emptyMedia(), type: 'video' }])}
                    className="mt-3 text-xs text-[#FF4D6D] font-semibold hover:underline">
                    Embed your first video
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((item, i) => (
                    <MediaRow key={i} item={item} index={i} onChange={updateVideo} onRemove={removeVideo} />
                  ))}
                  <button type="button"
                    onClick={() => setVideos(prev => [...prev, { ...emptyMedia(), type: 'video' }])}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-[#FF4D6D] hover:text-[#FF4D6D] transition-colors">
                    ＋ Add Another Video
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Publish controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900">Publish Settings</h3>

              {[
                { label: 'Published', hint: published ? '✅ Live on site' : '📋 Draft', value: published, set: setPublished, color: 'bg-emerald-500' },
                { label: 'Featured',  hint: 'Show in featured sections', value: featured, set: setFeatured, color: 'bg-[#6C63FF]' },
                { label: 'Breaking',  hint: 'Show breaking news badge', value: breaking,  set: setBreaking,  color: 'bg-[#FF4D6D]' },
              ].map(({ label, hint, value, set, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{hint}</p>
                  </div>
                  <button type="button" onClick={() => set((v: boolean) => !v)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${value ? color : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ml-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}

              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg">
                {saving ? 'Saving…' : isEdit ? '💾 Update Post' : '🚀 Publish Post'}
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
              <p className="text-xs text-gray-400">Shown as the hero image on the article page and in listing cards.</p>
              <input value={coverImage} onChange={e => setCover(e.target.value)}
                placeholder="https://example.com/cover.jpg"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                  <button type="button" onClick={() => setCover('')}
                    className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full text-xs hover:bg-black/70 transition-colors flex items-center justify-center">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl aspect-video flex items-center justify-center text-gray-300">
                  <span className="text-4xl">🖼️</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Tags</h3>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Afrobeats, Nollywood, Fashion"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
              <p className="text-xs text-gray-400">Separate multiple tags with commas.</p>
              {tags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.split(',').filter(t => t.trim()).map(t => (
                    <span key={t} className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-2.5 py-1 rounded-full font-medium">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media summary */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Media Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cover image</span>
                  <span className={coverImage ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>
                    {coverImage ? '✓ Set' : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference images</span>
                  <span className="font-semibold text-gray-700">{referenceImages.filter(m => m.url).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Videos</span>
                  <span className="font-semibold text-gray-700">{videos.filter(m => m.url).length}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
