import { useEffect, useState } from 'react';
import { Library, Users, BookCopy, AlertTriangle, RefreshCw, BookOpen } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import { LoadingState, ErrorState } from '../../components/StateViews';

const COLORS = ['#1E4FA3', '#4C7FD1', '#C8871E', '#1E7A4C', '#C23B3B', '#6E5AA6', '#2A9D8F', '#E76F51'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingState label="Loading admin dashboard…" />;
  if (error) return <ErrorState onRetry={load} />;

  const { stats, charts } = data;

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p className="muted mb-24">Library-wide statistics and activity.</p>

      <div className="grid-books" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', marginBottom: 28 }}>
        <StatCard icon={Library} label="Total Books" value={stats.totalBooks} color="var(--color-blue)" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="var(--color-blue-mid)" />
        <StatCard icon={BookCopy} label="Active Borrowings" value={stats.activeBorrowings} color="var(--color-success)" />
        <StatCard icon={AlertTriangle} label="Overdue Books" value={stats.overdueBooks} color="var(--color-danger)" />
        <StatCard icon={RefreshCw} label="Total Renewals" value={stats.totalRenewals} color="var(--color-amber)" />
        <StatCard icon={BookOpen} label="E-books" value={stats.totalEbooks} color="var(--color-navy)" />
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div className="card" style={{ flex: 1, minWidth: 320, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Books by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={charts.byCategory} dataKey="count" nameKey="category" outerRadius={90} label>
                {charts.byCategory.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 320, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Monthly Borrowing Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.monthlyBorrowing}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-blue)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Most Popular Books</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={charts.popularBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis dataKey="title" type="category" width={140} fontSize={10} />
              <Tooltip />
              <Bar dataKey="borrow_count" fill="var(--color-amber)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <h3 style={{ fontSize: '1rem' }}>Top Active Users</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={charts.userActivity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" fontSize={11} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={110} fontSize={10} />
              <Tooltip />
              <Bar dataKey="borrow_count" fill="var(--color-success)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
