import { useState, useEffect, useRef } from 'react';
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

function detectMediaType(url: string): 'image' | 'video' {
  const videoPatterns = ['youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com', '.mp4', '.webm', '.mov'];
  return videoPatterns.some(p => url.includes(p)) ? 'video' : 'image';
}

function getYouTubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// ── Cover Image Hero Panel ────────────────────────────────────────────────────
function CoverImagePanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState(value);
  const [imgOk, setImgOk] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync from parent (when editing existing post)
  useEffect(() => {
    setInput(value);
    if (value) { setImgOk(false); setImgErr(false); }
  }, [value]);

  const commit = (url: string) => {
    const trimmed = url.trim();
    setInput(trimmed);
    setImgOk(false);
    setImgErr(false);
    onChange(trimmed);
  };

  const clear = () => {
    setInput('');
    setImgOk(false);
    setImgErr(false);
    onChange('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Preview area */}
      {value && !imgErr ? (
        <div className="relative group">
          <div className="aspect-[21/9] bg-gray-100 overflow-hidden">
            <img
              src={value}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onLoad={() => { setImgOk(true); setImgErr(false); }}
              onError={() => { setImgOk(false); setImgErr(true); }}
            />
          </div>
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={clear}
              className="bg-white text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
              Remove cover
            </button>
          </div>
          {/* Status badge */}
          {imgOk && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
              Cover set
            </div>
          )}
        </div>
      ) : (
        /* Empty state drop zone */
        <div
          className="aspect-[21/9] bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-500">No cover image set</p>
            <p className="text-xs text-gray-400 mt-0.5">Paste an image URL below to preview it here</p>
          </div>
          {imgErr && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
              Could not load image — check the URL
            </div>
          )}
        </div>
      )}

      {/* URL input bar */}
      <div className="p-4">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Cover Image URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
              </svg>
            </span>
            <input
              ref={inputRef}
              type="url"
              value={input}
              onChange={e => {
                setInput(e.target.value);
                setImgErr(false);
              }}
              onBlur={e => commit(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(input); } }}
              placeholder="https://example.com/your-cover-image.jpg"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all"
            />
          </div>
          {input && (
            <button
              type="button"
              onClick={clear}
              className="px-3 py-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Clear cover image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Paste any image URL — it will preview instantly above. Shown as hero on article page and thumbnail in listing cards.
        </p>
      </div>
    </div>
  );
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
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
              {item.caption && <span>{item.caption}</span>}
              {item.source && <span className="text-gray-400">© {item.source}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Article Card Preview ───────────────────────────────────────────────────────
function CardPreview({ title, excerpt, coverImage, category }: {
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
}) {
  if (!title && !coverImage) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        Card Preview
      </h3>
      <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        {/* Thumbnail */}
        <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="preview" className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">📰</div>
          )}
        </div>
        {/* Card body */}
        <div className="p-3 space-y-1.5">
          {category && (
            <span className="inline-block text-xs font-bold text-[#6C63FF] uppercase tracking-wider">{category}</span>
          )}
          <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
            {title || 'Your article title will appear here…'}
          </p>
          {excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2">{excerpt}</p>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center">This is how the post will look in listing pages</p>
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

  const [title, setTitle]         = useState('');
  const [slug, setSlug]           = useState('');
  const [excerpt, setExcerpt]     = useState('');
  const [content, setContent]     = useState('');
  const [categoryId, setCategory] = useState('');
  const [tags, setTags]           = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured]   = useState(false);
  const [breaking, setBreaking]   = useState(false);
  const [rating, setRating]       = useState<number | null>(null);

  const [coverImage, setCover]           = useState('');
  const [referenceImages, setRefImages]  = useState<MediaItem[]>([]);
  const [videos, setVideos]              = useState<MediaItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

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
    setRating((existingPost as { rating?: number | null }).rating ?? null);
    const ri = (existingPost as { referenceImages?: MediaItem[] }).referenceImages ?? [];
    const vd = (existingPost as { videos?: MediaItem[] }).videos ?? [];
    setRefImages(ri.map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
    setVideos(vd.map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
  }, [existingPost]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim());
  };

  const updateRefImage = (i: number, item: MediaItem) => setRefImages(prev => prev.map((m, idx) => idx === i ? item : m));
  const removeRefImage = (i: number) => setRefImages(prev => prev.filter((_, idx) => idx !== i));
  const updateVideo    = (i: number, item: MediaItem) => setVideos(prev => prev.map((m, idx) => idx === i ? item : m));
  const removeVideo    = (i: number) => setVideos(prev => prev.filter((_, idx) => idx !== i));

  const selectedCategoryName = categories.find(c => c._id === categoryId)?.name ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError('Please select a category.'); return; }
    if (!content.trim()) { setError('Content cannot be empty.'); return; }

    const badRef = referenceImages.find(m => m.url && !m.url.startsWith('http'));
    const badVid = videos.find(m => m.url && !m.url.startsWith('http'));
    if (badRef) { setError('All reference image URLs must start with https://'); return; }
    if (badVid) { setError('All video URLs must start with https://'); return; }

    setError(''); setSuccess(''); setSaving(true);

    const payload = {
      title, slug, excerpt, content,
      coverImage: coverImage || undefined,
      referenceImages: referenceImages.filter(m => m.url),
      videos:          videos.filter(m => m.url),
      categoryId,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published, featured, breaking,
      rating: rating ?? null,
    };

    try {
      if (isEdit) {
        await updatePost.mutateAsync(payload);
        setSuccess('Post updated successfully!');
        setTimeout(() => navigate('/posts'), 800);
      } else {
        await createPost.mutateAsync(payload);
        setSuccess(published ? 'Post published!' : 'Draft saved!');
        setTimeout(() => navigate('/posts'), 800);
      }
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {isEdit ? 'Update your article content and settings.' : 'Write, preview, and publish a new article.'}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/posts')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Back to posts
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main column ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── COVER IMAGE — top of form, prominent ── */}
            <CoverImagePanel value={coverImage} onChange={setCover} />

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
                  <span className="px-3 text-xs text-gray-400 border-r border-gray-200 py-2.5 font-mono whitespace-nowrap">/article/</span>
                  <input value={slug} onChange={e => setSlug(e.target.value)} required
                    placeholder="article-url-slug"
                    className="flex-1 bg-transparent px-3 py-2.5 text-gray-900 font-mono text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Excerpt
                  <span className="ml-1 font-normal normal-case text-gray-400">— shown in listing cards and social shares</span>
                </label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  placeholder="Short compelling summary of your article…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none" />
              </div>
            </div>

            {/* Body content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">Body Content *</label>
                <span className="text-xs text-gray-400">
                  {content.trim().split(/\s+/).filter(Boolean).length} words
                  {content.trim().split(/\s+/).filter(Boolean).length > 0 && (
                    <span className="ml-1 text-gray-300">
                      · ~{Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
                    </span>
                  )}
                </span>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={18}
                placeholder="Write your full article here. Separate paragraphs with a blank line."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-y" />
            </div>

            {/* Reference Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Reference Images</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Additional images shown inside the article body.</p>
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
                  <p className="text-sm font-medium">No reference images yet</p>
                  <p className="text-xs mt-1 mb-3">Add extra images to enrich the article body.</p>
                  <button type="button" onClick={() => setRefImages([{ ...emptyMedia(), type: 'image' }])}
                    className="text-xs text-[#6C63FF] font-semibold hover:underline">
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

            {/* Videos */}
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
                  <p className="text-sm font-medium">No videos added yet</p>
                  <p className="text-xs mt-1 mb-3">Embed YouTube links or direct video URLs.</p>
                  <button type="button" onClick={() => setVideos([{ ...emptyMedia(), type: 'video' }])}
                    className="text-xs text-[#FF4D6D] font-semibold hover:underline">
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

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Publish controls */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900">Publish Settings</h3>

              {[
                { label: 'Published', hint: published ? '✅ Live on site' : '📋 Saved as draft', value: published, set: setPublished, color: 'bg-emerald-500' },
                { label: 'Featured',  hint: 'Show in hero / featured sections',  value: featured, set: setFeatured, color: 'bg-[#6C63FF]' },
                { label: 'Breaking',  hint: 'Show red breaking news badge', value: breaking, set: setBreaking, color: 'bg-[#FF4D6D]' },
              ].map(({ label, hint, value, set, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{hint}</p>
                  </div>
                  <button type="button" onClick={() => set((v: boolean) => !v)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${value ? color : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ml-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}

              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </>
                ) : isEdit ? '💾 Update Post' : published ? '🚀 Publish Now' : '📋 Save Draft'}
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

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Tags</h3>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Afrobeats, Nollywood, Fashion"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
              <p className="text-xs text-gray-400">Separate with commas.</p>
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

            {/* Rating — only shown when category is Reviews */}
            {selectedCategoryName.toLowerCase() === 'reviews' && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h3 className="text-sm font-black text-gray-900">Review Score</h3>
                </div>
                <p className="text-xs text-gray-400">Rate out of 10. Shown as a verdict badge on the Reviews page.</p>

                {/* Score picker — 10 buttons */}
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const active = rating === n;
                    const col = n >= 9 ? 'bg-emerald-500' : n >= 7 ? 'bg-sky-500' : n >= 5 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(active ? null : n)}
                        className={`h-10 rounded-xl text-sm font-black transition-all ${
                          active
                            ? `${col} text-white shadow-md scale-105`
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                {/* Verdict label */}
                {rating && (
                  <div className="flex items-center gap-3 pt-1">
                    <div className={`w-10 h-10 rounded-xl font-black text-base flex items-center justify-center ${
                      rating >= 9 ? 'bg-emerald-100 text-emerald-700'
                      : rating >= 7 ? 'bg-sky-100 text-sky-700'
                      : rating >= 5 ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {rating}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {rating >= 9 ? 'Masterpiece'
                          : rating >= 8 ? 'Must Watch'
                          : rating >= 7 ? 'Great'
                          : rating >= 6 ? 'Good'
                          : rating >= 5 ? 'Average'
                          : rating >= 4 ? 'Mixed'
                          : 'Skip It'}
                      </p>
                      <p className="text-xs text-gray-400">{rating}/10</p>
                    </div>
                    <button type="button" onClick={() => setRating(null)}
                      className="ml-auto text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors">
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Card Preview */}
            <CardPreview
              title={title}
              excerpt={excerpt}
              coverImage={coverImage}
              category={selectedCategoryName}
            />

            {/* Media summary */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Media Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cover image</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${coverImage ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-400'}`}>
                    {coverImage ? '✓ Set' : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reference images</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${referenceImages.filter(m => m.url).length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400'}`}>
                    {referenceImages.filter(m => m.url).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Videos</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${videos.filter(m => m.url).length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-400'}`}>
                    {videos.filter(m => m.url).length}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
