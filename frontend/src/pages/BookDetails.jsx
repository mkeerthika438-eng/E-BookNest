import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Heart, BookOpen, ScanLine, RefreshCw, Library, Calendar, Globe, Hash, User as UserIcon } from 'lucide-react';
import api, { fileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myBorrowing, setMyBorrowing] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReviewText, setMyReviewText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data.book);
      const revRes = await api.get(`/reviews/${data.book.id}`);
      setReviews(revRes.data.reviews);

      if (user) {
        const mine = revRes.data.reviews.find(r => r.user_id === user.id);
        if (mine) { setMyRating(mine.rating); setMyReviewText(mine.review || ''); }

        const [borrowRes, wishRes] = await Promise.all([
          api.get('/borrowings/my', { params: { status: 'active' } }),
          api.get('/wishlist')
        ]);
        const activeBorrow = borrowRes.data.borrowings.find(b => b.book_id === data.book.id);
        setMyBorrowing(activeBorrow || null);
        setInWishlist(wishRes.data.wishlist.some(w => w.id === data.book.id));
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  const requireLogin = () => {
    toast.info('Please log in to continue.');
    navigate('/login');
  };

  const handleBorrow = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      await api.post('/borrowings', { book_id: book.id });
      toast.success('Book borrowed successfully!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not borrow this book.');
    } finally { setBusy(false); }
  };

  const handleRenew = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/renewals', { borrowing_id: myBorrowing.id });
      toast.success(`Renewed! New due date: ${data.newDueDate}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Renewal not allowed.');
    } finally { setBusy(false); }
  };

  const toggleWishlist = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${book.id}`);
        toast.success('Removed from wishlist.');
      } else {
        await api.post('/wishlist', { book_id: book.id });
        toast.success('Added to wishlist.');
      }
      setInWishlist(!inWishlist);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wishlist action failed.');
    } finally { setBusy(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return requireLogin();
    if (myRating < 1) return toast.error('Please select a star rating.');
    setBusy(true);
    try {
      const existing = reviews.find(r => r.user_id === user.id);
      if (existing) {
        await api.put(`/reviews/${existing.id}`, { rating: myRating, review: myReviewText });
        toast.success('Review updated.');
      } else {
        await api.post('/reviews', { book_id: book.id, rating: myRating, review: myReviewText });
        toast.success('Review submitted.');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    } finally { setBusy(false); }
  };

  const deleteMyReview = async () => {
    const existing = reviews.find(r => r.user_id === user.id);
    if (!existing) return;
    setBusy(true);
    try {
      await api.delete(`/reviews/${existing.id}`);
      setMyRating(0); setMyReviewText('');
      toast.success('Review deleted.');
      load();
    } catch (err) {
      toast.error('Could not delete review.');
    } finally { setBusy(false); }
  };

  if (loading) return <LoadingState label="Loading book details…" />;
  if (error || !book) return <ErrorState title="Book not found" message="This book may have been removed." onRetry={load} />;

  const avgRating = Number(book.avg_rating || 0);

  return (
    <div className="container" style={{ padding: '32px 24px 60px' }}>
      <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {/* Cover + actions */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="card" style={{
            height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-blue-light)', overflow: 'hidden'
          }}>
            {book.cover_image
              ? <img src={fileUrl(book.cover_image)} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Library size={56} color="var(--color-blue-mid)" strokeWidth={1.2} />}
          </div>

          <div className="flex" style={{ flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {myBorrowing ? (
              <button className="btn btn-amber btn-block" disabled={busy} onClick={handleRenew}>
                <RefreshCw size={15} /> Renew (due {myBorrowing.due_date})
              </button>
            ) : (
              <button className="btn btn-primary btn-block" disabled={busy || book.available_copies < 1} onClick={handleBorrow}>
                {book.available_copies < 1 ? 'Currently Unavailable' : 'Borrow this Book'}
              </button>
            )}
            {book.ebook_file && (
              <Link to={`/read/${book.book_id}`} className="btn btn-outline btn-block">
                <BookOpen size={15} /> Read E-book
              </Link>
            )}
            <button className="btn btn-ghost btn-block" onClick={toggleWishlist} disabled={busy}>
              <Heart size={15} fill={inWishlist ? 'var(--color-danger)' : 'none'} color={inWishlist ? 'var(--color-danger)' : 'currentColor'} />
              {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
            <Link to="/qr-scanner" className="btn btn-ghost btn-block">
              <ScanLine size={15} /> Scan QR
            </Link>
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <span className="badge badge-blue mb-8">{book.category}</span>
          <h1 style={{ fontSize: '1.9rem' }}>{book.title}</h1>
          <p className="muted" style={{ fontSize: '1.05rem', marginTop: -6 }}>by {book.author}</p>

          <div className="flex gap-16" style={{ alignItems: 'center', margin: '10px 0 20px' }}>
            <StarRating value={avgRating} showValue />
            <span className="text-sm muted">({book.rating_count} ratings)</span>
            <span className={`badge ${book.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
              {book.available_copies > 0 ? `${book.available_copies} of ${book.total_copies} available` : 'Out of stock'}
            </span>
          </div>

          <p style={{ lineHeight: 1.7 }}>{book.description || 'No description available for this title.'}</p>

          <div className="card mt-24" style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <MetaRow icon={Hash} label="Book ID" value={book.book_id} />
              <MetaRow icon={Hash} label="ISBN" value={book.isbn || '—'} />
              <MetaRow icon={UserIcon} label="Publisher" value={book.publisher || '—'} />
              <MetaRow icon={Calendar} label="Published" value={book.publication_year || '—'} />
              <MetaRow icon={Globe} label="Language" value={book.language} />
              <MetaRow icon={BookOpen} label="E-book" value={book.ebook_file ? 'Available' : 'Not available'} />
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-32">
            <h3>Ratings & Reviews</h3>
            {user && (
              <form onSubmit={submitReview} className="card" style={{ padding: 18, marginBottom: 20 }}>
                <label className="text-sm" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>Your rating</label>
                <StarRating value={myRating} size={22} interactive onChange={setMyRating} />
                <textarea
                  className="input mt-16" rows={3} placeholder="Share your thoughts about this book…"
                  value={myReviewText} onChange={(e) => setMyReviewText(e.target.value)}
                />
                <div className="flex gap-8 mt-16">
                  <button className="btn btn-primary btn-sm" disabled={busy}>Submit Review</button>
                  {reviews.some(r => r.user_id === user.id) && (
                    <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={deleteMyReview} disabled={busy}>
                      Delete My Review
                    </button>
                  )}
                </div>
              </form>
            )}

            {reviews.length === 0 && <EmptyState title="No reviews yet" message="Be the first to share your thoughts." />}
            <div className="flex" style={{ flexDirection: 'column', gap: 14 }}>
              {reviews.map(r => (
                <div key={r.id} className="card" style={{ padding: 16 }}>
                  <div className="flex-between">
                    <strong className="text-sm">{r.user_name}</strong>
                    <StarRating value={r.rating} size={13} />
                  </div>
                  {r.review && <p className="text-sm mt-8" style={{ margin: '8px 0 0' }}>{r.review}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-8" style={{ alignItems: 'center' }}>
      <Icon size={15} color="var(--color-blue-mid)" />
      <div>
        <div className="text-sm muted" style={{ fontSize: '0.72rem' }}>{label}</div>
        <div className="text-sm" style={{ fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
