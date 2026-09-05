import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookCopy, RefreshCw, Heart, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { LoadingState, ErrorState } from '../../components/StateViews';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/dashboard/user').then(res => setData(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingState label="Loading your dashboard…" />;
  if (error) return <ErrorState onRetry={load} />;

  const { stats, recentActivity } = data;
  const chartData = [
    { name: 'Borrowed', value: stats.totalBorrowed },
    { name: 'Active', value: stats.currentlyBorrowed },
    { name: 'Renewed', value: stats.renewedBooks },
    { name: 'E-books', value: stats.ebooksRead },
  ];

  return (
    <div>
      <h2>Your Dashboard</h2>
      <p className="muted mb-24">A quick look at your library activity.</p>

      <div className="grid-books" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: 28 }}>
        <StatCard icon={BookCopy} label="Currently Borrowed" value={stats.currentlyBorrowed} color="var(--color-blue)" />
        <StatCard icon={Clock} label="Due Soon" value={stats.dueSoon} color="var(--color-danger)" />
        <StatCard icon={RefreshCw} label="Renewed Books" value={stats.renewedBooks} color="var(--color-amber)" />
        <StatCard icon={Heart} label="Wishlist" value={stats.wishlistCount} color="var(--color-success)" />
        <StatCard icon={BookOpen} label="E-books Read" value={stats.ebooksRead} color="var(--color-blue-mid)" />
        <StatCard icon={TrendingUp} label="Avg. Progress" value={`${stats.avgReadingProgress}%`} color="var(--color-navy)" />
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 2, minWidth: 300, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Activity Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--color-blue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 260, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Recent Activity</h3>
          {recentActivity.length === 0 && <p className="text-sm muted">No activity yet — go borrow a book!</p>}
          <div className="flex" style={{ flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {recentActivity.map((a, i) => (
              <div key={i} className="text-sm" style={{ borderLeft: '3px solid var(--color-blue-light)', paddingLeft: 10 }}>
                <strong style={{ textTransform: 'capitalize' }}>{a.action}</strong> — {a.title}
                <div className="muted" style={{ fontSize: '0.75rem' }}>{new Date(a.at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24">
        <Link to="/recommendations" className="btn btn-outline">See your recommendations →</Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <Icon size={20} color={color} />
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: 8 }}>{value}</div>
      <div className="text-sm muted">{label}</div>
    </div>
  );
}
