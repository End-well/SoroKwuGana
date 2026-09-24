import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { uploadImage } from '../../admin/lib/uploadImage';

// ── Floating message widget ───────────────────────────────────────────────────
function FloatingMessageWidget() {
  const [open, setOpen]         = useState(false);
  const [advertId, setAdvertId] = useState<string | null>(null);
  const [preview, setPreview]   = useState<{ text: string; sender: string; createdAt: string } | null>(null);
  const [unread, setUnread]     = useState(0);

  useEffect(() => {
    // Check if user has a previous advert stored
    const id = sessionStorage.getItem('last_advert_id');
    if (!id) return;
    setAdvertId(id);

    // Fetch last message for preview
    api.get(`/adverts/${id}/messages`)
      .then(res => {
        const messages = res.data?.messages ?? [];
        if (messages.length > 0) {
          const last = messages[messages.length - 1];
          setPreview(last);
          // Count unread admin messages
          const unreadCount = messages.filter((m: { sender: string; readByAdvertiser: boolean }) =>
            m.sender === 'admin' && !m.readByAdvertiser
          ).length;
          setUnread(unreadCount);
        }
      })
      .catch(() => {}); // silent if advert not found
  }, []);

  if (!advertId) return null;

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Preview popup */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-72 overflow-hidden animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Advert Support</p>
              <p className="text-white/70 text-xs">SoroKwuGana Team</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Last message preview */}
          <div className="px-4 py-3 border-b border-gray-100">
            {preview ? (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {preview.sender === 'admin' ? '🛡 SoroKwuGana Team' : 'You'} · {timeAgo(preview.createdAt)}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">{preview.text}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">No messages yet. Send us a message!</p>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 flex flex-col gap-2">
            <Link
              to={`/advert/${advertId}`}
              onClick={() => setOpen(false)}
              className="w-full text-center bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold text-sm py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Open Conversation →
            </Link>
            <p className="text-[10px] text-gray-400 text-center">
              Your advert ID: <code className="font-mono">{advertId.slice(-8)}</code>
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] shadow-xl shadow-[#6C63FF]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Open advert conversation"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        {/* Unread badge */}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}


const PLANS = [
  {
    key:      '1month' as const,
    label:    '1 Month',
    price:    2000,
    duration: '30 days',
    popular:  false,
    perks:    [
      'Your ad shown site-wide',
      'Featured in sidebar on all articles',
      'Logo + link on homepage',
      'Basic analytics (impressions)',
      'Email confirmation within 24h',
    ],
  },
  {
    key:      '6months' as const,
    label:    '6 Months',
    price:    5000,
    duration: '180 days',
    popular:  true,
    perks:    [
      'Everything in 1 Month',
      '6× longer visibility',
      'Priority placement in article feeds',
      'Featured newsletter mention (2×)',
      'Click & impression analytics',
      'Dedicated account manager',
    ],
  },
  {
    key:      '1year' as const,
    label:    '1 Year',
    price:    8000,
    duration: '365 days',
    popular:  false,
    perks:    [
      'Everything in 6 Months',
      '12 months of premium placement',
      'Homepage banner slot',
      'Monthly performance reports',
      'Featured in all newsletter editions',
      'First priority for new ad placements',
      'Free creative consultation',
    ],
  },
];

type Plan = '1month' | '6months' | '1year';

function formatNGN(n: number) {
  return `₦${n.toLocaleString('en-NG')}`;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Choose Plan', 'Your Details', 'Review & Submit'];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => {
        const n    = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                done   ? 'bg-[#6C63FF] text-white' :
                active ? 'bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white shadow-lg shadow-[#6C63FF]/30' :
                         'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`mt-1.5 text-xs font-semibold whitespace-nowrap hidden sm:block ${active ? 'text-[#6C63FF]' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-12 sm:w-20 mx-1 sm:mx-2 transition-colors ${done ? 'bg-[#6C63FF]' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Input helpers ─────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-all';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Advertise() {
  const [step, setStep]   = useState<1 | 2 | 3>(1);
  const [plan, setPlan]   = useState<Plan | null>(null);
  const [form, setForm]   = useState({
    businessName:  '',
    contactName:   '',
    email:         '',
    phone:         '',
    website:       '',
    adTitle:       '',
    adDescription: '',
    adImageUrl:    '',
    adLinkUrl:     '',
  });
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setPreview]  = useState('');
  const [uploadingImg, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const selectedPlan = PLANS.find(p => p.key === plan);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!plan) return;
    setError('');
    setSubmitting(true);
    try {
      let adImageUrl = form.adImageUrl;
      // Upload image file if one was selected
      if (imageFile) {
        adImageUrl = await uploadImage(imageFile);
      }
      const res = await api.post('/adverts', { ...form, adImageUrl, plan });
      // Store advert ID so user can access conversation page
      sessionStorage.setItem('last_advert_id', res.data.id);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success ──────────────────────────────────────────────────────────────────
  const lastAdvertId = sessionStorage.getItem('last_advert_id');
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
      <FloatingMessageWidget />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#6C63FF]/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-3">Request Submitted!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Thank you, <strong className="text-gray-700 dark:text-gray-200">{form.businessName}</strong>!
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            We have received your advert request for the <strong>{selectedPlan?.label}</strong> plan ({formatNGN(selectedPlan?.price ?? 0)}).
            Our team will review it and reach you at <strong>{form.email}</strong> within 24 hours with payment details.
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 text-left border border-gray-100 dark:border-gray-700 mb-6">
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">What happens next?</p>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="font-black text-[#6C63FF] flex-shrink-0">1.</span>We review your ad content (usually within a few hours)</li>
              <li className="flex items-start gap-2"><span className="font-black text-[#6C63FF] flex-shrink-0">2.</span>We send you payment details via email</li>
              <li className="flex items-start gap-2"><span className="font-black text-[#6C63FF] flex-shrink-0">3.</span>Your ad goes live within 24h of payment confirmation</li>
            </ol>
          </div>
          {lastAdvertId && (
            <div className="bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm font-black text-[#6C63FF] mb-1">💬 Your Conversation Page</p>
              <p className="text-xs text-gray-600 mb-2">Bookmark this link to track your ad status and communicate with our team:</p>
              <a href={`/advert/${lastAdvertId}`}
                className="text-xs text-[#6C63FF] font-mono bg-white border border-[#6C63FF]/30 px-3 py-2 rounded-xl block hover:underline break-all">
                {window.location.origin}/advert/{lastAdvertId}
              </a>
            </div>
          )}
          <a href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-lg">
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <FloatingMessageWidget />

      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Advertise</span>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white leading-tight mb-4">
          Reach <span className="gradient-text">Millions</span> of<br className="hidden sm:block" /> African Readers
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
          Promote your business to our growing audience of entertainment, lifestyle, and culture enthusiasts across Africa and the diaspora.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Monthly Readers', value: '50K+' },
          { label: 'African Countries', value: '20+' },
          { label: 'Avg. Session', value: '4 min' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center shadow-sm">
            <p className="font-display font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <Steps current={step} />

      {/* ── Step 1: Choose Plan ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white text-center">Choose Your Plan</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map(p => (
              <div
                key={p.key}
                onClick={() => setPlan(p.key)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  plan === p.key
                    ? 'border-[#6C63FF] bg-[#6C63FF]/5 dark:bg-[#6C63FF]/10 shadow-lg shadow-[#6C63FF]/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#6C63FF]/50'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-900 dark:text-white text-lg">{p.label}</h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    plan === p.key ? 'border-[#6C63FF] bg-[#6C63FF]' : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {plan === p.key && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">{formatNGN(p.price)}</span>
                  <span className="text-gray-400 text-sm ml-1">/ {p.duration}</span>
                </div>

                <ul className="space-y-2">
                  {p.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-[#6C63FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => { if (plan) setStep(2); }}
              disabled={!plan}
              className="bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-black px-10 py-3.5 rounded-full hover:opacity-90 disabled:opacity-40 transition-opacity shadow-lg shadow-[#6C63FF]/20 text-sm"
            >
              Continue with {selectedPlan ? `${selectedPlan.label} — ${formatNGN(selectedPlan.price)}` : 'Selected Plan'} →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Details ───────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white text-center">Your Business & Ad Details</h2>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider">Business Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Business Name" required>
                <input value={form.businessName} onChange={set('businessName')} placeholder="e.g. Zara Lagos" className={inputCls} />
              </Field>
              <Field label="Contact Name" required>
                <input value={form.contactName} onChange={set('contactName')} placeholder="Your full name" className={inputCls} />
              </Field>
              <Field label="Email Address" required>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@business.com" className={inputCls} />
              </Field>
              <Field label="Phone Number">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 800 000 0000" className={inputCls} />
              </Field>
              <Field label="Website" hint="Optional — where should readers go?">
                <input type="url" value={form.website} onChange={set('website')} placeholder="https://yourbusiness.com" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider">Ad Content</h3>
            <div className="space-y-4">
              <Field label="Ad Headline" required hint="Short, catchy title for your ad (max 100 chars)">
                <input value={form.adTitle} onChange={set('adTitle')} maxLength={100} placeholder="e.g. Shop Authentic African Fashion" className={inputCls} />
              </Field>
              <Field label="Ad Description" required hint="Describe your product or offer (max 500 chars)">
                <textarea value={form.adDescription} onChange={set('adDescription')} rows={3} maxLength={500}
                  placeholder="Tell readers what makes your business special…"
                  className={`${inputCls} resize-none`} />
                <span className="text-[10px] text-gray-400 font-mono">{form.adDescription.length}/500</span>
              </Field>
              <Field label="Ad Image" hint="Upload your banner or logo (recommended: 1200×630, max 20 MB)">
                <div className="space-y-2">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      imagePreview ? 'border-[#6C63FF]/40 bg-[#6C63FF]/5' : 'border-gray-200 hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/5'
                    }`}
                  >
                    {uploadingImg ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <span className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-gray-500">Uploading…</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Ad preview" className="w-full h-32 object-cover rounded-lg" />
                        <p className="text-xs text-[#6C63FF] mt-2 font-semibold">✓ Image uploaded — click to change</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-2xl mb-1">🖼</p>
                        <p className="text-sm font-semibold text-gray-600">Click to upload ad image</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP — up to 20 MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      setPreview(URL.createObjectURL(file));
                      setUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setForm(prev => ({ ...prev, adImageUrl: url }));
                      } catch {
                        setError('Image upload failed. Please try again.');
                        setImageFile(null);
                        setPreview('');
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                </div>
              </Field>
              <Field label="Click Destination URL" hint="Where readers go when they click your ad">
                <input type="url" value={form.adLinkUrl} onChange={set('adLinkUrl')} placeholder="https://yourbusiness.com/offer" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => setStep(1)}
              className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              ← Back
            </button>
            <button
              onClick={() => {
                if (!form.businessName || !form.contactName || !form.email || !form.adTitle || !form.adDescription) {
                  setError('Please fill in all required fields.');
                  return;
                }
                setError('');
                setStep(3);
              }}
              className="px-8 py-3 text-sm font-black text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] rounded-full hover:opacity-90 transition-opacity shadow-lg"
            >
              Review Submission →
            </button>
          </div>
          {error && <p className="text-center text-sm text-red-500 font-medium">{error}</p>}
        </div>
      )}

      {/* ── Step 3: Review ────────────────────────────────────────────────────── */}
      {step === 3 && selectedPlan && (
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white text-center">Review & Submit</h2>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800">
            {/* Plan summary */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-0.5">Selected Plan</p>
                <p className="font-black text-gray-900 dark:text-white">{selectedPlan.label} <span className="text-gray-400 font-normal">({selectedPlan.duration})</span></p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#6C63FF]">{formatNGN(selectedPlan.price)}</p>
                <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-[#6C63FF] transition-colors">Change</button>
              </div>
            </div>

            {/* Business */}
            <div className="p-5">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Business Details</p>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-400">Business:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{form.businessName}</span></div>
                <div><span className="text-gray-400">Contact:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{form.contactName}</span></div>
                <div><span className="text-gray-400">Email:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{form.email}</span></div>
                {form.phone && <div><span className="text-gray-400">Phone:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{form.phone}</span></div>}
                {form.website && <div className="sm:col-span-2"><span className="text-gray-400">Website:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{form.website}</span></div>}
              </div>
            </div>

            {/* Ad */}
            <div className="p-5">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Ad Content</p>
              <p className="font-bold text-gray-900 dark:text-white mb-1">{form.adTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{form.adDescription}</p>
              {form.adImageUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-28 w-full">
                  <img src={form.adImageUrl} alt="Ad preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Payment note */}
            <div className="p-5 bg-[#6C63FF]/5 dark:bg-[#6C63FF]/10 rounded-b-2xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6C63FF] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div className="text-sm text-[#6C63FF] dark:text-[#a78bfa]">
                  <p className="font-bold mb-0.5">Payment on approval</p>
                  <p className="opacity-80">After submitting, our team reviews your ad. You will receive payment instructions at <strong>{form.email}</strong> once approved. No charge until then.</p>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-center text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => setStep(2)}
              className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              ← Edit Details
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 text-sm font-black text-white bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] rounded-full hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg flex items-center gap-2"
            >
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                : <>Submit Advert Request ✓</>
              }
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800">
        <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {[
            { q: 'How does payment work?', a: 'After your ad is reviewed and approved, we send payment details to your email. Your ad goes live within 24 hours of payment confirmation.' },
            { q: 'What payment methods do you accept?', a: 'We accept bank transfer and major Nigerian payment platforms. Details will be sent upon approval.' },
            { q: 'Can I update my ad after submission?', a: 'Yes — reach out to us via email and we can update your ad content or image at any time during your campaign.' },
            { q: 'What type of ads perform best?', a: 'Ads with a clear headline, compelling description, and a high-quality banner image consistently outperform text-only ads on our platform.' },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <p className="font-black text-gray-900 dark:text-white text-sm mb-2">{q}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
