import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RefreshCw, Library } from 'lucide-react';
import api, { fileUrl } from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function MyBooks() {
  const [filter, setFilter] = useState('active');
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/borrowings/my', { params: filter === 'all' ? {} : { status: filter } })
      .then(res => setBorrowings(res.data.borrowings))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleRenew = async (id) => {
    setBusyId(id);
    try {
      const { data } = await api.post('/renewals', { borrowing_id: id });
      toast.success(`Renewed! New due date: ${data.newDueDate}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Renewal not allowed.');
    } finally { setBusyId(null); }
  };

  const isOverdue = (b) => b.status === 'active' && new Date(b.due_date) < new Date();
  return (
    <div>
      <h2>My Books</h2>
      <p className="muted mb-16">Everything you've borrowed from the library.</p>

      <div className="flex gap-8 mb-24">
        {['active', 'returned', 'all'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && borrowings.length === 0 && (
        <EmptyState title="No books here" message="Borrow a book to see it listed here." action={<Link to="/books" className="btn btn-primary btn-sm">Browse Books</Link>} />
      )}

      <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
        {borrowings.map(b => (
          <div key={b.id} className="card flex-between" style={{ padding: 16, flexWrap: 'wrap', gap: 12 }}>
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              <div style={{ width: 48, height: 64, background: 'var(--color-blue-light)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {b.cover_image ? <img src={fileUrl(b.cover_image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Library size={18} color="var(--color-blue-mid)" />}
              </div>
              <div>
                <Link to={`/books/${b.book_code}`} style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{b.title}</Link>
                <div className="text-sm muted">{b.author}</div>
                <div className="text-sm muted">Borrowed {new Date(b.borrowed_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              {b.status === 'active' ? (
                <>
                  <span className={`badge ${isOverdue(b) ? 'badge-danger' : 'badge-amber'}`}>
                    {isOverdue(b) ? 'Overdue' : `Due ${b.due_date}`}
                  </span>
                  {b.live_fine > 0 && (
                    <span className="badge badge-danger">Fine: ₹{b.live_fine}</span>
                  )}
                </>
              ) : (
                <>
                  <span className="badge badge-success">Returned {new Date(b.returned_at).toLocaleDateString()}</span>
                  {Number(b.fine_amount) > 0 && (
                    <span className={`badge ${b.fine_paid ? 'badge-success' : 'badge-danger'}`}>
                      Fine ₹{b.fine_amount} {b.fine_paid ? '(Paid)' : '(Unpaid)'}
                    </span>
                  )}
                </>
              )}
              {b.status === 'active' && (
                <button className="btn btn-outline btn-sm" disabled={busyId === b.id} onClick={() => handleRenew(b.id)}>
                  <RefreshCw size={13} /> Renew
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
