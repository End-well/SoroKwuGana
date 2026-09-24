import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-[#6C63FF]">Home</Link> <span>/</span>
        <span className="text-gray-400">Contact</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white leading-tight mb-4">
            Let's Talk
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Have a story tip, press release, collaboration idea, or just want to say hi? We'd love to hear from you.
          </p>
          <div className="space-y-4">
            {[
              { icon: '📧', label: 'Email', value: 'hello@sorokwugana.com' },
              { icon: '📍', label: 'Location', value: 'Lagos, Nigeria' },
              { icon: '💼', label: 'Partnerships', value: 'partners@sorokwugana.com' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-gray-900 dark:text-white font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-black/5">
          {sent ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-2">Message Sent!</h2>
              <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSent(false)} className="mt-6 text-[#6C63FF] font-semibold hover:underline text-sm">Send another →</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-display font-black text-xl text-gray-900 dark:text-white mb-6">Send a Message</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                  <input type="text" required placeholder="Your name"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input type="email" required placeholder="your@email.com"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                <input type="text" placeholder="Story tip, collaboration..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea required rows={5} placeholder="Your message..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-transparent transition-colors resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-gradient-to-r from-[#6C63FF] to-[#FF4D6D] text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#6C63FF]/25 text-sm">
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
