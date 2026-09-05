import { useEffect, useState } from 'react';
import { FileBarChart, Download } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, ErrorState } from '../../components/StateViews';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/dashboard/admin').then(res => setData(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const { stats, charts } = data;

  const downloadCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Books', stats.totalBooks],
      ['Total Users', stats.totalUsers],
      ['Active Borrowings', stats.activeBorrowings],
      ['Overdue Books', stats.overdueBooks],
      ['Total Renewals', stats.totalRenewals],
      ['Total E-books', stats.totalEbooks],
      [],
      ['Category', 'Book Count'],
      ...charts.byCategory.map(c => [c.category, c.count]),
      [],
      ['Book', 'Times Borrowed'],
      ...charts.popularBooks.map(b => [b.title, b.borrow_count])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ebooknest-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2><FileBarChart size={20} style={{ verticalAlign: -3 }} /> Reports</h2>
          <p className="muted" style={{ margin: 0 }}>Snapshot of library performance, exportable as CSV.</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={downloadCsv}><Download size={14} /> Export CSV</button>
      </div>

      <div className="grid-books" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))' }}>
        {[
          ['Total Books', stats.totalBooks], ['Total Users', stats.totalUsers],
          ['Active Borrowings', stats.activeBorrowings], ['Overdue Books', stats.overdueBooks],
          ['Total Renewals', stats.totalRenewals], ['Total E-books', stats.totalEbooks]
        ].map(([label, value]) => (
          <div key={label} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
            <div className="text-sm muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="card mt-24" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem' }}>Books by Category</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
          <tbody>
            {charts.byCategory.map(c => (
              <tr key={c.category} style={{ borderTop: '1px solid var(--color-border)' }}>
                <td style={{ padding: '8px 4px', fontSize: '0.88rem' }}>{c.category}</td>
                <td style={{ padding: '8px 4px', fontSize: '0.88rem', textAlign: 'right' }}>{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
