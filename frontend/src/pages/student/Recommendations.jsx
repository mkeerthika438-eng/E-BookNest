import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import api from '../../services/api';
import BookCard from '../../components/BookCard';
import { EmptyState, ErrorState, BookSkeletonGrid } from '../../components/StateViews';

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/recommendations').then(res => setData(res.data)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <h2><Sparkles size={20} style={{ verticalAlign: -3 }} color="var(--color-amber)" /> Recommended for You</h2>
      <p className="muted mb-24">
        {data?.basis === 'popular'
          ? 'Since you\'re just getting started, here are the library\'s most-borrowed titles.'
          : 'Based on your borrowing history, ratings, and wishlist.'}
      </p>

      {loading && <BookSkeletonGrid count={8} />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && data.recommendations.length === 0 && (
        <EmptyState title="No recommendations yet" message="Borrow or rate a few books to get personalized picks." />
      )}
      {!loading && !error && data.recommendations.length > 0 && (
        <div className="grid-books">
          {data.recommendations.map(b => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  );
}
