import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { MessageSquare, EyeOff, Eye } from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function ReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/reviews/admin/all').then(res => setReviews(res.data.reviews)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleStatus = async (r) => {
    const newStatus = r.status === 'visible' ? 'hidden' : 'visible';
    try {
      await api.put(`/reviews/${r.id}/moderate`, { status: newStatus });
      setReviews(reviews.map(x => x.id === r.id ? { ...x, status: newStatus } : x));
      toast.success(newStatus === 'hidden' ? 'Review hidden.' : 'Review made visible.');
    } catch {
      toast.error('Could not update review.');
    }
  };

  return (
    <div>
      <h2><MessageSquare size={20} style={{ verticalAlign: -3 }} /> Review Moderation</h2>
      <p className="muted mb-24">Hide inappropriate reviews from public view.</p>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && reviews.length === 0 && <EmptyState title="No reviews yet" />}

      <div className="flex" style={{ flexDirection: 'column', gap: 12 }}>
        {reviews.map(r => (
          <div key={r.id} className="card flex-between" style={{ padding: 16, flexWrap: 'wrap', gap: 12, opacity: r.status === 'hidden' ? 0.55 : 1 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="flex-between">
                <strong className="text-sm">{r.user_name} on "{r.book_title}"</strong>
                <StarRating value={r.rating} size={13} />
              </div>
              {r.review && <p className="text-sm muted" style={{ margin: '6px 0 0' }}>{r.review}</p>}
              <span className={`badge ${r.status === 'visible' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 8 }}>{r.status}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(r)}>
              {r.status === 'visible' ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Unhide</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
