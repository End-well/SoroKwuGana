import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategories, useCreatePost, useUpdatePost, useAdminPost } from '../hooks/useStats';
import { uploadImage } from '../lib/uploadImage';

// ── Types ──────────────────────────────────────────────────────────────────────
interface MediaItem {
  url: string;
  type: 'image' | 'video';
  caption: string;
  source: string;
}

const emptyMedia = (): MediaItem => ({ url: '', type: 'image', caption: '', source: '' });

function detectMediaType(url: string): 'image' | 'video' {
  return ['youtube.com', 'youtu.be', 'vimeo.com', 'tiktok.com', '.mp4', '.webm', '.mov']
    .some(p => url.toLowerCase().includes(p)) ? 'video' : 'image';
}

function getYouTubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// ── Icon ──────────────────────────────────────────────────────────────────────
function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const IC = {
  upload:  'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
  link:    'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  image:   'm2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  close:   'M6 18L18 6M6 6l12 12',
  check:   'M5 13l4 4L19 7',
  spin:    '', // used as class only
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  arrow:   'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  video:   'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  plus:    'M12 4v16m8-8H4',
};

type UploadMode = 'url' | 'file';
type UploadState = 'idle' | 'uploading' | 'done' | 'error';

// ── ImageUploader — dual mode: paste URL or upload file ───────────────────────
interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectClass?: string;
  compact?: boolean;
}

function ImageUploader({ value, onChange, aspectClass = 'aspect-[21/9]', compact = false }: ImageUploaderProps) {
  const [mode, setMode]     = useState<UploadMode>('url');
  const [urlInput, setUrl]  = useState(value);
  const [state, setState]   = useState<UploadState>('idle');
  const [err, setErr]       = useState('');
  const [dragging, setDrag] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // Sync url input when parent changes value (edit mode population)
  useEffect(() => { setUrl(value); }, [value]);

  const commit = (url: string) => {
    const v = url.trim();
    setUrl(v);
    onChange(v);
    setErr('');
  };

  const clear = () => {
    setUrl('');
    onChange('');
    setErr('');
    setState('idle');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const doUpload = useCallback(async (file: File) => {
    setState('uploading');
    setErr('');
    try {
      const url = await uploadImage(file);
      setUrl(url);
      onChange(url);
      setState('done');
    } catch (e: unknown) {
      setState('error');
      setErr((e as Error).message ?? 'Upload failed.');
    }
  }, [onChange]);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    doUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) { setMode('file'); doUpload(file); }
  };

  // ── If a URL/uploaded image is set, show preview directly ─────────────────
  if (value) {
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className={`${aspectClass} ${compact ? 'max-h-40' : ''} bg-gray-100 overflow-hidden`}>
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Don't loop — just hide the broken image and show an error
              (e.target as HTMLImageElement).style.display = 'none';
              setErr('Could not load image. The URL may be broken.');
            }}
          />
        </div>
        {err && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-2 px-4 text-center">
            <span className="text-2xl">🖼</span>
            <p className="text-xs text-red-500 font-medium">{err}</p>
            <button type="button" onClick={clear}
              className="text-xs font-bold text-[#6C63FF] hover:underline">
              Remove & try again
            </button>
          </div>
        )}
        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button type="button" onClick={() => { clear(); setMode('url'); }}
            className="bg-white text-gray-800 font-semibold text-xs px-4 py-2 rounded-xl shadow hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Icon d={IC.link} className="w-3.5 h-3.5" />
            Change URL
          </button>
          <button type="button" onClick={() => { fileRef.current?.click(); }}
            className="bg-white text-gray-800 font-semibold text-xs px-4 py-2 rounded-xl shadow hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Icon d={IC.upload} className="w-3.5 h-3.5" />
            Replace File
          </button>
          <button type="button" onClick={clear}
            className="bg-red-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow hover:bg-red-600 transition-colors flex items-center gap-1.5">
            <Icon d={IC.trash} className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
        <div className="absolute top-3 right-3 bg-gray-900/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Icon d={IC.check} className="w-3 h-3" />
          Set
        </div>
        {err && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs font-medium px-3 py-2 text-center">
            {err}
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  // ── No image — show mode tabs + input ─────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['url', 'file'] as UploadMode[]).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === m ? 'bg-white text-[#6C63FF] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {m === 'url' ? '🔗 Paste URL' : '📁 Upload File'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Icon d={IC.link} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="url"
                value={urlInput}
                onChange={e => { setUrl(e.target.value); setErr(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (urlInput.trim()) commit(urlInput); } }}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => { if (urlInput.trim()) commit(urlInput); }}
              disabled={!urlInput.trim()}
              className="px-4 py-2.5 bg-[#6C63FF] text-white text-sm font-bold rounded-xl hover:bg-[#5a52e0] disabled:opacity-40 transition-colors flex-shrink-0"
            >
              Set
            </button>
            {urlInput && (
              <button type="button" onClick={clear}
                className="px-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <Icon d={IC.close} className="w-4 h-4" />
              </button>
            )}
          </div>
          {err && <p className="text-xs text-red-500 font-medium">{err}</p>}
          {!compact && <p className="text-xs text-gray-400">Paste an image URL and click Set to preview.</p>}
        </div>
      ) : (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              compact ? 'py-6' : 'py-12'
            } ${dragging ? 'border-[#6C63FF] bg-[#6C63FF]/5' : 'border-gray-200 bg-gray-50 hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/5'}`}
          >
            {state === 'uploading' ? (
              <>
                <span className="w-10 h-10 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-gray-500">Uploading…</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                  <Icon d={IC.upload} className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600">{dragging ? 'Drop to upload' : 'Click or drag & drop'}</p>
                  {!compact && <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, GIF — up to 20 MB</p>}
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files?.[0])} />
          {err && <p className="mt-2 text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
          {!compact && state !== 'uploading' && (
            <p className="mt-2 text-xs text-gray-400">Image uploads are stored in MongoDB via the backend.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cover Image Panel ─────────────────────────────────────────────────────────
function CoverImagePanel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Icon d={IC.image} className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900">Cover Image</h3>
          <p className="text-xs text-gray-400">Shown as hero and thumbnail. Upload a file or paste a URL.</p>
        </div>
      </div>
      <ImageUploader value={value} onChange={onChange} label="Cover" aspectClass="aspect-[21/9]" />
    </div>
  );
}

// ── Media Row (reference images + videos) ─────────────────────────────────────
function MediaRow({ item, index, onChange, onRemove }: {
  item: MediaItem;
  index: number;
  onChange: (i: number, updated: MediaItem) => void;
  onRemove: (i: number) => void;
}) {
  const ytEmbed = item.type === 'video' ? getYouTubeEmbed(item.url) : null;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.type === 'video' ? 'bg-rose-100' : 'bg-violet-100'}`}>
            <Icon d={item.type === 'video' ? IC.video : IC.image} className={`w-3.5 h-3.5 ${item.type === 'video' ? 'text-rose-600' : 'text-violet-600'}`} />
          </div>
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
            {item.type === 'video' ? 'Video' : 'Image'} {index + 1}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={item.type}
            onChange={e => onChange(index, { ...item, type: e.target.value as 'image' | 'video' })}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <button type="button" onClick={() => onRemove(index)}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1">
            <Icon d={IC.trash} className="w-3 h-3" />
            Remove
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Image uploader (only for images) or URL input (for videos) */}
        {item.type === 'image' ? (
          <ImageUploader
            value={item.url}
            onChange={url => onChange(index, { ...item, url, type: 'image' })}
            label={`Image ${index + 1}`}
            aspectClass="aspect-video"
            compact
          />
        ) : (
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Video URL</label>
            <div className="relative">
              <Icon d={IC.link} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={item.url}
                onChange={e => { const url = e.target.value; onChange(index, { ...item, url, type: detectMediaType(url) }); }}
                placeholder="YouTube, Vimeo, TikTok, or direct .mp4 URL"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
              />
            </div>
          </div>
        )}

        {/* Caption + Source */}
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Caption</label>
            <input value={item.caption} onChange={e => onChange(index, { ...item, caption: e.target.value })}
              placeholder="Optional caption…"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Source / Credit</label>
            <input value={item.source} onChange={e => onChange(index, { ...item, source: e.target.value })}
              placeholder="e.g. Getty Images"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
          </div>
        </div>

        {/* Video preview */}
        {item.type === 'video' && item.url && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {ytEmbed ? (
              <iframe src={ytEmbed} className="w-full aspect-video" allowFullScreen title="video preview" />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-xl">
                <Icon d={IC.video} className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500 truncate font-mono">{item.url}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PostEditor ─────────────────────────────────────────────────────────────────
export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit  = !!id;
  const navigate = useNavigate();

  const { data: categories = [] } = useCategories();
  const { data: existingPost }    = useAdminPost(id ?? '');
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
  const [coverImage, setCover]    = useState('');
  const [refImages, setRefImages] = useState<MediaItem[]>([]);
  const [videos, setVideos]       = useState<MediaItem[]>([]);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [tiktokFile, setTiktokFile] = useState<File | null>(null);
  const [tiktokUploading, setTiktokUploading] = useState(false);
  const [tiktokErr, setTiktokErr] = useState('');
  const tiktokFileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // Populate form when editing
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
    setRefImages(((existingPost as { referenceImages?: MediaItem[] }).referenceImages ?? []).map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
    setVideos(((existingPost as { videos?: MediaItem[] }).videos ?? []).map(m => ({ url: m.url, type: m.type, caption: m.caption ?? '', source: m.source ?? '' })));
    // Load TikTok video if present
    const tiktokVid = ((existingPost as { videos?: MediaItem[] }).videos ?? []).find(v => v.url?.includes('tiktok.com'));
    if (tiktokVid) setTiktokUrl(tiktokVid.url);
  }, [existingPost]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim());
  };

  const updateRef   = (i: number, item: MediaItem) => setRefImages(p => p.map((m, idx) => idx === i ? item : m));
  const removeRef   = (i: number) => setRefImages(p => p.filter((_, idx) => idx !== i));
  const updateVideo = (i: number, item: MediaItem) => setVideos(p => p.map((m, idx) => idx === i ? item : m));
  const removeVideo = (i: number) => setVideos(p => p.filter((_, idx) => idx !== i));

  const selectedCatName = categories.find(c => c._id === categoryId)?.name ?? '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError('Please select a category.'); return; }
    if (!content.trim()) { setError('Content cannot be empty.'); return; }
    setError(''); setSuccess(''); setSaving(true);

    const allVideos = [
      ...videos.filter(m => m.url),
      // Prepend TikTok video if set and not already in the list
      ...(tiktokUrl && !videos.some(v => v.url === tiktokUrl)
        ? [{ url: tiktokUrl, type: 'video' as const, caption: 'TikTok', source: 'TikTok' }]
        : []),
    ];

    const payload = {
      title, slug, excerpt, content,
      coverImage: coverImage || undefined,
      referenceImages: refImages.filter(m => m.url),
      videos: allVideos,
      categoryId,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      published, featured, breaking,
      rating: rating ?? null,
    };

    try {
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updatePost.mutateAsync(payload as any);
        setSuccess('Post updated!');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createPost.mutateAsync(payload as any);
        setSuccess(published ? '🚀 Post published! Share it on TikTok to reach more readers.' : '📋 Draft saved!');
      }
      setTimeout(() => navigate('/admin/posts'), 800);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Post' : 'New Post'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Update your article content and settings.' : 'Write, preview, and publish a new article.'}
          </p>
        </div>
        <button type="button" onClick={() => navigate('/admin/posts')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">
          <Icon d={IC.arrow} className="w-4 h-4" />
          Back to Posts
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <Icon d={IC.close} className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
            <Icon d={IC.check} className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
          {published && !isEdit && (
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 text-white text-sm px-4 py-3 rounded-xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-white">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
              <div className="flex-1">
                <p className="font-bold text-sm">Share on TikTok</p>
                <p className="text-xs text-gray-400 mt-0.5">Post this story to your TikTok followers</p>
              </div>
              <a
                href="https://www.tiktok.com/@sorokwugana_blog"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white text-gray-900 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Open TikTok →
              </a>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Main column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Cover image */}
            <CoverImagePanel value={coverImage} onChange={setCover} />

            {/* Title / Slug / Excerpt */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input value={title} onChange={e => handleTitleChange(e.target.value)} required
                  placeholder="Article title…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">
                  Slug <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#6C63FF]">
                  <span className="px-3 text-xs text-gray-400 border-r border-gray-200 py-2.5 font-mono whitespace-nowrap bg-gray-100">/article/</span>
                  <input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="article-url-slug"
                    className="flex-1 bg-transparent px-3 py-2.5 text-gray-900 font-mono text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-1.5">Excerpt</label>
                <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                  placeholder="Short summary for listing cards and social shares…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-none" />
              </div>
            </div>

            {/* Body */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Body Content <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{wordCount} words</span>
                  {wordCount > 0 && <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>}
                </div>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={20}
                placeholder="Write your full article here. Use blank lines to separate paragraphs."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6C63FF] resize-y" />
            </div>

            {/* Reference Images */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Reference Images</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Additional images shown in the article. Upload files or paste URLs.</p>
                </div>
                <button type="button"
                  onClick={() => setRefImages(p => [...p, emptyMedia()])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C63FF] bg-[#6C63FF]/10 hover:bg-[#6C63FF]/20 px-3 py-2 rounded-xl transition-colors">
                  <Icon d={IC.plus} className="w-3.5 h-3.5" />
                  Add Image
                </button>
              </div>
              {refImages.length === 0 ? (
                <div
                  onClick={() => setRefImages([emptyMedia()])}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5 transition-all"
                >
                  <Icon d={IC.image} className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-400">No reference images yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click to add the first one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {refImages.map((item, i) => (
                    <MediaRow key={i} item={item} index={i} onChange={updateRef} onRemove={removeRef} />
                  ))}
                  <button type="button" onClick={() => setRefImages(p => [...p, emptyMedia()])}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-400 hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors flex items-center justify-center gap-2">
                    <Icon d={IC.plus} className="w-4 h-4" />
                    Add Another Image
                  </button>
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Videos</h3>
                  <p className="text-xs text-gray-400 mt-0.5">YouTube, Vimeo, TikTok or direct video file URLs.</p>
                </div>
                <button type="button"
                  onClick={() => setVideos(p => [...p, { ...emptyMedia(), type: 'video' }])}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4D6D] bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20 px-3 py-2 rounded-xl transition-colors">
                  <Icon d={IC.plus} className="w-3.5 h-3.5" />
                  Add Video
                </button>
              </div>
              {videos.length === 0 ? (
                <div
                  onClick={() => setVideos([{ ...emptyMedia(), type: 'video' }])}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-[#FF4D6D]/40 hover:bg-[#FF4D6D]/5 transition-all"
                >
                  <Icon d={IC.video} className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-400">No videos yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click to embed the first one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {videos.map((item, i) => (
                    <MediaRow key={i} item={item} index={i} onChange={updateVideo} onRemove={removeVideo} />
                  ))}
                  <button type="button" onClick={() => setVideos(p => [...p, { ...emptyMedia(), type: 'video' }])}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-400 hover:border-[#FF4D6D] hover:text-[#FF4D6D] transition-colors flex items-center justify-center gap-2">
                    <Icon d={IC.plus} className="w-4 h-4" />
                    Add Another Video
                  </button>
                </div>
              )}
            </div>

            {/* TikTok Short Video */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">TikTok Short Video</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Attach a TikTok video to this post. Paste a TikTok URL or upload a short video file.</p>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {['url', 'upload'].map(m => (
                  <button key={m} type="button"
                    onClick={() => { setTiktokUrl(''); setTiktokFile(null); setTiktokErr(''); }}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg capitalize bg-white text-gray-700 shadow-sm">
                    {m === 'url' ? '🔗 TikTok URL' : '📁 Upload Video'}
                  </button>
                ))}
              </div>

              {/* URL input */}
              {!tiktokFile && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={tiktokUrl}
                      onChange={e => { setTiktokUrl(e.target.value); setTiktokErr(''); }}
                      placeholder="https://www.tiktok.com/@username/video/..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                    />
                    {tiktokUrl && (
                      <button type="button" onClick={() => setTiktokUrl('')}
                        className="px-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Icon d={IC.close} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Or — <button type="button" onClick={() => tiktokFileRef.current?.click()}
                      className="text-[#6C63FF] font-semibold hover:underline">upload a video file</button> instead (MP4, WebM, MOV)
                  </p>
                </div>
              )}

              {/* File upload zone */}
              {!tiktokUrl && (
                <div>
                  <div
                    onClick={() => tiktokFileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-900/50 hover:bg-gray-900/5 transition-all"
                  >
                    {tiktokUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-semibold text-gray-500">Uploading video…</p>
                      </div>
                    ) : tiktokFile ? (
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-900 flex-shrink-0">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                        </svg>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{tiktokFile.name}</p>
                          <p className="text-xs text-gray-400">{(tiktokFile.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={e => { e.stopPropagation(); setTiktokFile(null); }}
                          className="text-gray-400 hover:text-red-500 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-300 mx-auto mb-2">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                        </svg>
                        <p className="text-sm font-semibold text-gray-500">Click to upload TikTok video</p>
                        <p className="text-xs text-gray-400 mt-0.5">MP4, WebM, MOV — up to 20 MB</p>
                      </>
                    )}
                  </div>
                  {tiktokErr && <p className="mt-2 text-xs text-red-500 font-medium">{tiktokErr}</p>}
                </div>
              )}

              {/* TikTok video preview */}
              {tiktokUrl && tiktokUrl.includes('tiktok.com') && (
                <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 flex-shrink-0">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{tiktokUrl}</p>
                    <p className="text-gray-400 text-[10px] mt-0.5">TikTok video will appear embedded in the article</p>
                  </div>
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-white flex-shrink-0">Preview ↗</a>
                </div>
              )}

              <input
                ref={tiktokFileRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 20 * 1024 * 1024) { setTiktokErr('File too large. Maximum is 20 MB.'); return; }
                  setTiktokFile(file);
                  setTiktokUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('image', file); // backend upload endpoint accepts any file
                    const token = localStorage.getItem('admin_token');
                    const res = await fetch('/api/upload', {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token ?? ''}` },
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.url) setTiktokUrl(data.url);
                    else throw new Error('No URL returned');
                  } catch (e: unknown) {
                    setTiktokErr((e as Error).message ?? 'Upload failed.');
                    setTiktokFile(null);
                  } finally {
                    setTiktokUploading(false);
                  }
                }}
              />
            </div>

          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Publish settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-900">Publish Settings</h3>
              {[
                { label: 'Published', hint: published ? 'Live on site' : 'Saved as draft', value: published, set: setPublished, color: 'bg-emerald-500' },
                { label: 'Featured',  hint: 'Show in hero sections',                       value: featured, set: setFeatured, color: 'bg-[#6C63FF]' },
                { label: 'Breaking',  hint: 'Show red breaking news badge',                value: breaking, set: setBreaking, color: 'bg-[#FF4D6D]' },
              ].map(({ label, hint, value, set, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{hint}</p>
                  </div>
                  <button type="button" onClick={() => set((v: boolean) => !v)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 ${value ? color : 'bg-gray-200'}`}
                    role="switch" aria-checked={value}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 mt-0.5 ml-0.5 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg flex items-center justify-center gap-2 mt-2">
                {saving
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
                  : isEdit ? '💾 Update Post' : published ? '🚀 Publish Now' : '📋 Save Draft'
                }
              </button>
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Category <span className="text-rose-400">*</span></h3>
              <select value={categoryId} onChange={e => setCategory(e.target.value)} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]">
                <option value="">Select a category…</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-black text-gray-900">Tags</h3>
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Afrobeats, Nollywood, Fashion"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
              <p className="text-xs text-gray-400">Comma-separated.</p>
              {tags && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.split(',').filter(t => t.trim()).map(t => (
                    <span key={t} className="text-xs bg-[#6C63FF]/10 text-[#6C63FF] px-2.5 py-1 rounded-full font-semibold">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Review score */}
            {selectedCatName.toLowerCase() === 'reviews' && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <h3 className="text-sm font-black text-gray-900">Review Score</h3>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                    const active = rating === n;
                    const col = n >= 9 ? 'bg-emerald-500' : n >= 7 ? 'bg-sky-500' : n >= 5 ? 'bg-amber-400' : 'bg-red-400';
                    return (
                      <button key={n} type="button" onClick={() => setRating(active ? null : n)}
                        className={`h-10 rounded-xl text-sm font-black transition-all ${active ? `${col} text-white shadow-md scale-105` : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                        {n}
                      </button>
                    );
                  })}
                </div>
                {rating && (
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl font-black text-base flex items-center justify-center ${rating >= 9 ? 'bg-emerald-100 text-emerald-700' : rating >= 7 ? 'bg-sky-100 text-sky-700' : rating >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {rating}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">
                        {rating >= 9 ? 'Masterpiece' : rating >= 8 ? 'Must Watch' : rating >= 7 ? 'Great' : rating >= 6 ? 'Good' : rating >= 5 ? 'Average' : rating >= 4 ? 'Mixed' : 'Skip It'}
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

            {/* Media summary */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Media Summary</h3>
              <div className="space-y-2">
                {[
                  { label: 'Cover image',      ok: !!coverImage,                                set: coverImage ? '✓ Set' : 'Not set',     color: coverImage ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-400' },
                  { label: 'Reference images', ok: refImages.filter(m => m.url).length > 0,    set: String(refImages.filter(m => m.url).length), color: refImages.filter(m => m.url).length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400' },
                  { label: 'Videos',           ok: videos.filter(m => m.url).length > 0,       set: String(videos.filter(m => m.url).length),    color: videos.filter(m => m.url).length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-400' },
                ].map(({ label, set, color }) => (
                  <div key={label} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{set}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
