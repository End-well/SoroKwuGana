import { Link } from 'react-router-dom';

const team = [
  { name: 'Adaeze Okafor', role: 'Editor-in-Chief', avatar: 'https://i.pravatar.cc/80?img=47', bio: 'Award-winning journalist with 12 years covering African entertainment and culture.' },
  { name: 'Chioma Bello', role: 'Fashion Director', avatar: 'https://i.pravatar.cc/80?img=45', bio: 'Former stylist turned editor, covering global fashion from a distinctly African lens.' },
  { name: 'Emeka Nwosu', role: 'Entertainment Reporter', avatar: 'https://i.pravatar.cc/80?img=12', bio: 'Breaking stories before they break everywhere else. Entertainment is his sport.' },
  { name: 'Ngozi Eze', role: 'Celebrity Correspondent', avatar: 'https://i.pravatar.cc/80?img=32', bio: 'Your inside source for everything happening in celebrity land.' },
];

const stats = [
  { value: '5M+', label: 'Monthly Readers' },
  { value: '50K+', label: 'Newsletter Subscribers' },
  { value: '500+', label: 'Stories Published' },
  { value: '20+', label: 'Countries Reached' },
];

export default function About() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-[#6C63FF]">Home</Link> <span>/</span>
        <span className="text-gray-400">About</span>
      </nav>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#6C63FF] to-[#FF4D6D] p-10 lg:p-16 text-white mb-14 shadow-2xl shadow-[#6C63FF]/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-2xl">
          <span className="text-white/60 text-sm font-semibold uppercase tracking-widest">Our Story</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-6xl leading-tight mt-2 mb-4">We Tell the Stories That Matter</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            SoroKwuGana — which means "speak to me" in Igbo — was born from a simple belief: African voices deserve a premium platform. We cover entertainment, culture, lifestyle and everything in between, always with authenticity and passion.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {stats.map(s => (
          <div key={s.value} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center shadow-sm">
            <p className="font-display font-black text-3xl gradient-text">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section className="mb-14 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Our Mission</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
          We exist to celebrate, amplify and archive the stories of African entertainment and lifestyle. From the biggest Afrobeats stars to the underground fashion designers redefining style, from celebrity drama to health and wellness — SoroKwuGana covers it all with the depth and quality it deserves.
        </p>
      </section>

      {/* Team */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 bg-gradient-to-b from-[#6C63FF] to-[#FF4D6D] rounded-full" />
          <h2 className="font-display font-black text-2xl text-gray-900 dark:text-white">Meet the Team</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(member => (
            <div key={member.name} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center card-hover shadow-sm">
              <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full mx-auto mb-4 ring-4 ring-[#6C63FF]/20 object-cover" />
              <h3 className="font-black text-gray-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-[#6C63FF] font-semibold mb-2">{member.role}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
