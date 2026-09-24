/**
 * Floating advert message widget — shown on every user page.
 * Only visible when the user has a previous advert (sessionStorage).
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Message {
  _id: string;
  sender: 'admin' | 'advertiser';
  text: string;
  readByAdvertiser: boolean;
  createdAt: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function AdvertMessageWidget() {
  const [open, setOpen]       = useState(false);
  const [advertId, setId]     = useState<string | null>(null);
  const [messages, setMsgs]   = useState<Message[]>([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('last_advert_id');
    if (!id) return;
    setId(id);
    fetchMessages(id);
    // Poll every 30s for new admin messages
    const interval = setInterval(() => fetchMessages(id), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/adverts/${id}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: Message[] = data.messages ?? [];
      setMsgs(msgs);
      setUnread(msgs.filter(m => m.sender === 'admin' && !m.readByAdvertiser).length);
    } catch { /* silent */ }
  };

  if (!advertId) return null;

  const lastMsg = messages[messages.length - 1];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Advert Support</p>
              <p className="text-white/70 text-xs">SoroKwuGana Team</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Last message preview */}
          <div className="px-4 py-3 border-b border-gray-100 min-h-[60px]">
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Loading…</span>
              </div>
            ) : lastMsg ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {lastMsg.sender === 'admin' ? '🛡 SoroKwuGana Team' : 'You'} · {timeAgo(lastMsg.createdAt)}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">{lastMsg.text}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-1">No messages yet. Tap below to start chatting.</p>
            )}
          </div>

          {/* Recent messages (up to 3) */}
          {messages.length > 1 && (
            <div className="px-4 py-2 space-y-1.5 max-h-36 overflow-y-auto bg-gray-50 border-b border-gray-100">
              {messages.slice(-3, -1).map(msg => (
                <div key={msg._id} className={`text-xs px-3 py-1.5 rounded-xl max-w-[85%] ${
                  msg.sender === 'advertiser'
                    ? 'bg-[#6C63FF] text-white ml-auto'
                    : 'bg-white border border-gray-200 text-gray-700'
                }`}>
                  {msg.text.slice(0, 80)}{msg.text.length > 80 ? '…' : ''}
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="px-4 py-3">
            <Link
              to={`/advert/${advertId}`}
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              Open Full Conversation
            </Link>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Advert ID: <code className="font-mono">{advertId.slice(-8)}</code>
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setOpen(v => !v); if (!open) { setLoading(true); fetchMessages(advertId).finally(() => setLoading(false)); } }}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] shadow-xl shadow-[#6C63FF]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Advert support chat"
        title="Advert messages"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
