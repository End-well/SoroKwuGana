import { useAuth } from '../context/AuthContext';

const stats = [
  { label: 'Total Posts', value: '—', color: 'bg-rose-500' },
  { label: 'Published', value: '—', color: 'bg-emerald-500' },
  { label: 'Drafts', value: '—', color: 'bg-amber-500' },
  { label: 'Comments', value: '—', color: 'bg-blue-500' },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name} 👋</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl mb-4`} />
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h2>
        <p className="text-gray-400 text-sm">Posts will appear here once the backend is connected.</p>
      </div>
    </div>
  );
}
