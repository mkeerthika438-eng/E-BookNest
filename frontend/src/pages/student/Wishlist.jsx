import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';
import api from '../../services/api';
import BookCard from '../../components/BookCard';
import { LoadingState, EmptyState, ErrorState, BookSkeletonGrid } from '../../components/StateViews';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/wishlist').then(res => setItems(res.data.wishlist)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (bookId) => {
    try {
      await api.delete(`/wishlist/${bookId}`);
      setItems(items.filter(i => i.id !== bookId));
      toast.success('Removed from wishlist.');
    } catch {
      toast.error('Could not remove item.');
    }
  };

  return (
    <div>
      <h2><Heart size={20} style={{ verticalAlign: -3 }} color="var(--color-danger)" /> My Wishlist</h2>
      <p className="muted mb-24">Books you're saving for later.</p>

      {loading && <BookSkeletonGrid count={6} />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="Your wishlist is empty" message="Save books you want to read later." action={<Link to="/books" className="btn btn-primary btn-sm">Browse Books</Link>} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid-books">
          {items.map(book => (
            <div key={book.id} style={{ position: 'relative' }}>
              <BookCard book={book} />
              <button
                className="btn btn-ghost btn-sm"
                style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.92)', padding: '4px 10px' }}
                onClick={(e) => { e.preventDefault(); remove(book.id); }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
