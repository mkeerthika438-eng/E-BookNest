import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/reading-history', { params: category ? { category } : {} })
      .then(res => setHistory(res.data.history))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [category]);
  useEffect(() => { api.get('/books/categories/list').then(res => setCategories(res.data.categories)).catch(() => {}); }, []);

  return (
    <div>
      <h2><History size={20} style={{ verticalAlign: -3 }} /> Reading History</h2>
      <p className="muted mb-16">Books and e-books you've engaged with.</p>

      <select className="input mb-24" style={{ maxWidth: 220 }} value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && history.length === 0 && (
        <EmptyState title="No reading history yet" message="Start reading an e-book to build your history." action={<Link to="/books?ebook=true" className="btn btn-primary btn-sm">Browse E-books</Link>} />
      )}

      <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
        {history.map(h => (
          <div key={h.id} className="card flex-between" style={{ padding: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <Link to={`/books/${h.book_id}`} style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{h.title}</Link>
              <div className="text-sm muted">{h.author} · {h.category}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-sm">Page {h.last_page} · {Number(h.progress).toFixed(0)}% complete</div>
              <div className="text-sm muted">Last read {new Date(h.last_read_at).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
