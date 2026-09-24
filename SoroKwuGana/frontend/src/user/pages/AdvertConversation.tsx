/**
 * /advert/:id — Advertiser conversation page
 * Active as long as the advert exists (user bookmarks the URL after step 3)
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { uploadImage } from '../../admin/lib/uploadImage';

interface Message {
  _id: string;
  sender: 'admin' | 'advertiser';
  text: string;
  imageUrl?: string;
  isSystem?: boolean;
  createdAt: string;
}

interface PaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode?: string;
  additionalInfo?: string;
}

interface Advert {
  _id: string;
  businessName: string;
  adTitle: string;
  plan: string;
  amount: number;
  status: string;
  startDate?: string;
  endDate?: string;
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

export default function AdvertConversation() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [text, setText]           = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending]     = useState(false);
  const [error, setError]         = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['advert-conv', id],
    queryFn: () => api.get(`/adverts/${id}/messages`).then(r => r.data),
    refetchInterval: 10000, // poll every 10s for new admin messages
    enabled: !!id,
  });

  const messages: Message[]      = data?.messages ?? [];
  const advert: Advert | null    = data?.advert ?? null;
  const payment: PaymentSettings | null = data?.paymentSettings ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (payload: { text: string; imageUrl?: string }) =>
      api.post(`/adverts/${id}/messages`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advert-conv', id] });
      setText('');
      setImageFile(null);
    },
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
      await sendMutation.mutateAsync({ text: text.trim() || (imageUrl ? '📎 Image attached' : ''), imageUrl: imageUrl || undefined });
    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    expired:  'bg-gray-100 text-gray-500',
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!advert) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-black text-gray-900 mb-2">Advert Not Found</h2>
        <p className="text-gray-500 mb-6">The advert ID in this link is invalid or has been removed.</p>
        <Link to="/advertise" className="text-[#6C63FF] font-semibold hover:underline">Submit a new advert →</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4">
          ← Back to site
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Advert Conversation</h1>
        <p className="text-sm text-gray-500 mt-1">Communicate with the SoroKwuGana team about your ad campaign.</p>
      </div>

      {/* Advert summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-black text-gray-900">{advert.businessName}</p>
            <p className="text-sm text-gray-500 mt-0.5">{advert.adTitle}</p>
            <p className="text-xs text-gray-400 mt-1">
              {PLAN_LABELS[advert.plan] ?? advert.plan} · {formatNGN(advert.amount)}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_COLORS[advert.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {advert.status}
          </span>
        </div>
      </div>

      {/* Payment details (shown when approved) */}
      {advert.status === 'approved' && payment && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4">
          <p className="text-sm font-black text-emerald-800 mb-3 flex items-center gap-2">
            🏦 Payment Details
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div><span className="text-emerald-600 text-xs font-semibold">Bank</span><br /><span className="font-bold text-gray-800">{payment.bankName}</span></div>
            <div><span className="text-emerald-600 text-xs font-semibold">Account Name</span><br /><span className="font-bold text-gray-800">{payment.accountName}</span></div>
            <div><span className="text-emerald-600 text-xs font-semibold">Account Number</span><br /><span className="font-black text-gray-900 text-lg tracking-wider">{payment.accountNumber}</span></div>
            {payment.bankCode && <div><span className="text-emerald-600 text-xs font-semibold">Sort Code</span><br /><span className="font-bold text-gray-800">{payment.bankCode}</span></div>}
          </div>
          {payment.additionalInfo && (
            <p className="mt-3 text-xs text-emerald-700 bg-emerald-100 rounded-xl px-3 py-2">{payment.additionalInfo}</p>
          )}
          <p className="text-xs text-emerald-600 mt-3">
            Amount to pay: <strong className="text-emerald-800">{formatNGN(advert.amount)}</strong> · After paying, send your receipt below and our team will activate your campaign.
          </p>
        </div>
      )}

      {/* Message thread */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900">Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">Refreshes automatically every 10 seconds</p>
        </div>

        <div className="px-5 py-4 space-y-4 min-h-[240px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-400">No messages yet. Send us a message below!</p>
              <p className="text-xs text-gray-400 mt-1">Our team will respond within 24 hours.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={`flex ${msg.sender === 'advertiser' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.isSystem
                    ? 'bg-blue-50 border border-blue-100 text-blue-800 text-xs text-center w-full max-w-full rounded-xl'
                    : msg.sender === 'advertiser'
                    ? 'bg-[#6C63FF] text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 rounded-bl-sm'
                }`}>
                  {!msg.isSystem && (
                    <p className={`text-[10px] font-bold mb-1 ${msg.sender === 'advertiser' ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.sender === 'admin' ? '🛡 SoroKwuGana Team' : 'You'}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.imageUrl && (
                    <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                      <img src={msg.imageUrl} alt="attachment" className="rounded-xl max-h-48 object-cover w-full" />
                      <p className="text-[10px] mt-1 opacity-60">Click to view full image</p>
                    </a>
                  )}
                  <p className={`text-[10px] mt-1 ${msg.sender === 'advertiser' ? 'text-white/50 text-right' : 'text-gray-400'}`}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Message input */}
        <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {imageFile && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-sm">📎 {imageFile.name}</span>
              <button type="button" onClick={() => setImageFile(null)} className="ml-auto text-gray-400 hover:text-red-500 text-xs font-bold">✕ Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              title="Attach image (receipt or screenshot)"
            >
              📎
            </button>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent"
            />
            <button
              type="submit"
              disabled={(!text.trim() && !imageFile) || sending || uploading}
              className="flex-shrink-0 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {uploading ? '⬆' : sending ? '…' : 'Send'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400">Upload payment receipts or screenshots here. Our team checks messages daily.</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
        </form>
      </div>

      {/* Bookmark reminder */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
        <p className="text-xs text-amber-800 font-semibold">📌 Bookmark this page!</p>
        <p className="text-xs text-amber-700 mt-0.5">This is your private conversation page for this advert. Save the URL to return anytime.</p>
        <code className="text-[10px] text-amber-600 font-mono mt-1 block">{window.location.href}</code>
      </div>
    </div>
  );
}
