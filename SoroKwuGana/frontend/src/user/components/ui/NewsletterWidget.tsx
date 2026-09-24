/**
 * Reusable newsletter subscribe widget.
 * Wires to POST /api/newsletter/subscribe on the backend.
 * Use the `variant` prop to switch between the two visual styles.
 */
import { useState } from 'react';

type Variant = 'dark' | 'gradient';

interface Props {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
}

export default function NewsletterWidget({
  variant = 'gradient',
  title,
  subtitle,
  buttonLabel = 'Subscribe →',
}: Props) {
  const [email, setEmail]     = useState('');
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? "You're subscribed! Check your inbox.");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Connection error. Please try again.');
    }
  };

  // ── Gradient variant (white text on gradient bg) ───────────────────────────
  if (variant === 'gradient') {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-6 text-white shadow-xl shadow-[#6C63FF]/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative">
          <h3 className="font-display font-black text-xl leading-tight mb-1.5">
            {title ?? 'Never Miss a Story'}
          </h3>
          <p className="text-white/75 text-sm mb-4">
            {subtitle ?? 'Join 50,000+ readers. Weekly digest, zero spam.'}
          </p>

          {status === 'success' ? (
            <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-4 py-3">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-semibold text-white">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
                placeholder="your@email.com"
                required
                className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-2.5 text-white placeholder-white/55 text-sm focus:outline-none focus:bg-white/25 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white text-[#6C63FF] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-100 disabled:opacity-60 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {status === 'loading'
                  ? <><span className="w-3.5 h-3.5 border-2 border-[#6C63FF]/40 border-t-[#6C63FF] rounded-full animate-spin" />Subscribing…</>
                  : buttonLabel
                }
              </button>
              {status === 'error' && <p className="text-xs text-red-200 font-medium">{message}</p>}
            </form>
          )}
          {status !== 'success' && (
            <p className="mt-2.5 text-white/45 text-xs">No spam. Unsubscribe anytime.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Dark variant (white on dark bg) ───────────────────────────────────────
  return (
    <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 text-white">
      <h3 className="font-display font-black text-lg mb-1">
        {title ?? 'Stay in the Loop'}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {subtitle ?? 'Get the hottest stories delivered to your inbox.'}
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-3">
          <span className="text-emerald-400 text-lg">✓</span>
          <p className="text-sm font-semibold text-emerald-300">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
            placeholder="your@email.com"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg flex items-center justify-center gap-2"
          >
            {status === 'loading'
              ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Subscribing…</>
              : buttonLabel
            }
          </button>
          {status === 'error' && <p className="text-xs text-red-400 font-medium">{message}</p>}
        </form>
      )}
    </div>
  );
}
