/**
 * /admin/adverts/:id/messages — admin side of the conversation
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { uploadImage } from '../lib/uploadImage';

interface Message {
  _id: string;
  sender: 'admin' | 'advertiser';
  text: string;
  imageUrl?: string;
  isSystem?: boolean;
  readByAdmin: boolean;
  createdAt: string;
}
interface Advert {
  _id: string;
  businessName: string;
  contactName: string;
  email: string;
  adTitle: string;
  plan: string;
  amount: number;
  status: string;
}

const PLAN_LABELS: Record<string, string> = { '1month': '1 Month', '6months': '6 Months', '1year': '1 Year' };
function formatNGN(n: number) { return `₦${n.toLocaleString('en-NG')}`; }
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function AdvertMessages() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  const [text, setText]           = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['advert-messages-admin', id],
    queryFn: () => api.get(`/adverts/${id}/messages/admin`).then(r => r.data),
    refetchInterval: 15000,
    enabled: !!id,
  });

  const messages: Message[] = data?.messages ?? [];
  const advert: Advert | null = data?.advert ?? null;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (payload: { text: string; imageUrl?: string }) =>
      api.post(`/adverts/${id}/messages/admin`, payload).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['advert-messages-admin', id] }); setText(''); setImageFile(null); },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    setError('');
    let imageUrl = '';
    if (imageFile) {
      setUploading(true);
      try { imageUrl = await uploadImage(imageFile); }
      catch (e: unknown) { setError((e as Error).message); setUploading(false); return; }
      setUploading(false);
    }
    setSending(true);
    try {
      await sendMutation.mutateAsync({ text: text.trim() || '📎 Image attached', imageUrl: imageUrl || undefined });
    } catch { setError('Failed to send.'); }
    finally { setSending(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    expired:  'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/adverts" className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <Icon d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-900">Advert Conversation</h1>
          {advert && <p className="text-sm text-gray-500">{advert.businessName} · {advert.contactName} · {advert.email}</p>}
        </div>
      </div>

      {/* Advert summary */}
      {advert && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-bold text-gray-900 text-sm">{advert.adTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">{PLAN_LABELS[advert.plan] ?? advert.plan} · {formatNGN(advert.amount)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[advert.status] ?? 'bg-gray-100'}`}>
              {advert.status}
            </span>
            <Link to="/admin/adverts" className="text-xs text-[#6C63FF] font-semibold hover:underline">Manage →</Link>
          </div>
        </div>
      )}

      {/* Advertiser link */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
        <p className="text-xs text-blue-700">
          Share this link with the advertiser so they can view this conversation:
          <code className="ml-1 font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">
            {window.location.origin}/advert/{id}
          </code>
        </p>
      </div>

      {/* Thread */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">Messages</h2>
          <span className="text-xs text-gray-400">Auto-refreshes every 15s</span>
        </div>

        <div className="px-5 py-4 space-y-4 min-h-[240px] max-h-[420px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <span className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-400">No messages yet. Send the advertiser a message.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.isSystem
                    ? 'bg-blue-50 border border-blue-100 text-blue-800 text-xs text-center w-full max-w-full rounded-xl'
                    : msg.sender === 'admin'
                    ? 'bg-[#6C63FF] text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  {!msg.isSystem && (
                    <p className={`text-[10px] font-bold mb-1 ${msg.sender === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.sender === 'admin' ? 'You (Admin)' : advert?.contactName ?? 'Advertiser'}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                      <img src={msg.imageUrl} alt="attachment" className="rounded-xl max-h-48 object-cover w-full" />
                      <p className="text-[10px] mt-1 opacity-60">Receipt / attachment</p>
                    </a>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                    {timeAgo(msg.createdAt)}
                    {msg.sender === 'advertiser' && !msg.readByAdmin && (
                      <span className="ml-2 bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500">{error}</p>}
          {imageFile && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-sm flex-1 truncate">📎 {imageFile.name}</span>
              <button type="button" onClick={() => setImageFile(null)} className="text-gray-400 hover:text-red-500 text-xs font-bold">✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors" title="Attach image">
              📎
            </button>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a message to the advertiser…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]" />
            <button type="submit" disabled={(!text.trim() && !imageFile) || sending || uploading}
              className="flex-shrink-0 bg-[#6C63FF] hover:bg-[#5a52e0] text-white font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 transition-colors">
              {uploading ? '⬆' : sending ? '…' : 'Send'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
        </form>
      </div>
    </div>
  );
}
