import { Link } from 'react-router-dom';
import { BookOpen, Library } from 'lucide-react';
import { fileUrl } from '../services/api';
import StarRating from './StarRating';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.book_id || book.id}`} className="card book-card" style={{ display: 'block', overflow: 'hidden' }}>
      <div style={{
        height: 190, background: 'var(--color-blue-light)', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
      }}>
        {book.cover_image ? (
          <img src={fileUrl(book.cover_image)} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Library size={44} color="var(--color-blue-mid)" strokeWidth={1.3} />
        )}
        {book.ebook_file && (
          <span className="badge badge-blue" style={{ position: 'absolute', top: 10, right: 10 }}>
            <BookOpen size={11} /> E-book
          </span>
        )}
        {Number(book.available_copies) === 0 && (
          <span className="badge badge-danger" style={{ position: 'absolute', top: 10, left: 10 }}>Unavailable</span>
        )}
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <h4 style={{ fontSize: '0.98rem', margin: '0 0 3px', color: 'var(--color-ink)', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
          {book.title}
        </h4>
        <p className="text-sm muted" style={{ margin: '0 0 8px' }}>{book.author}</p>
        <div className="flex-between">
          <StarRating value={book.avg_rating || 0} size={13} showValue />
          <span className="text-sm muted">{book.category}</span>
        </div>
      </div>
    </Link>
  );
}
