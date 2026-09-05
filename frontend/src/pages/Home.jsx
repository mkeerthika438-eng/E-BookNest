import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ScanLine, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookSkeletonGrid } from '../components/StateViews';

const CATEGORIES = ['Computer Science', 'Programming', 'AI', 'Machine Learning', 'Database', 'Networking', 'Fiction', 'Science', 'Mathematics'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/books?sort=rating&limit=4'),
      api.get('/books?sort=popular&limit=4'),
      api.get('/books?sort=recent&limit=8')
    ]).then(([a, b, c]) => {
      setFeatured(a.data.books);
      setPopular(b.data.books);
      setRecent(c.data.books);
    }).finally(() => setLoading(false));
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, var(--color-navy), var(--color-blue) 130%)', color: '#fff', padding: '68px 0 90px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.14)', color: '#EAF1FC', marginBottom: 18 }}>
            Digital Library Platform
          </span>
          <h1 style={{ color: '#fff', fontSize: '2.6rem', maxWidth: 700, margin: '0 auto 14px' }}>
            Discover, borrow, and read — all in one shelf
          </h1>
          <p style={{ color: '#C9D6EC', maxWidth: 560, margin: '0 auto 32px', fontSize: '1.05rem' }}>
            Search the catalog, scan a book's QR code for instant details, or dive straight into an e-book from your campus library.
          </p>
          <form onSubmit={submitSearch} className="flex-center" style={{ gap: 10, maxWidth: 560, margin: '0 auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={17} style={{ position: 'absolute', left: 16, top: 15, color: 'var(--color-ink-soft)' }} />
              <input
                className="input"
                style={{ paddingLeft: 42, height: 48, borderRadius: 999 }}
                placeholder="Search by title, author, ISBN, or Book ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-amber" style={{ height: 48, padding: '0 24px' }}>Search</button>
          </form>
          <div className="flex-center gap-16 mt-24" style={{ flexWrap: 'wrap' }}>
            <Link to="/qr-scanner" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              <ScanLine size={17} /> Scan a Book QR
            </Link>
            <Link to="/books?ebook=true" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              <BookOpen size={17} /> Browse E-Books
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: -46 }}>
        <div className="card flex-between" style={{ padding: '22px 28px', flexWrap: 'wrap', gap: 18 }}>
          {CATEGORIES.slice(0, 6).map(cat => (
            <Link key={cat} to={`/books?category=${encodeURIComponent(cat)}`} className="text-sm" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
              {cat}
            </Link>
          ))}
          <Link to="/books" className="text-sm" style={{ color: 'var(--color-blue)', fontWeight: 700 }}>
            All categories <ArrowRight size={13} style={{ verticalAlign: -2 }} />
          </Link>
        </div>
      </div>

      {/* Featured */}
      <section className="container" style={{ marginTop: 56 }}>
        <div className="flex-between mb-24">
          <h2>Featured Books</h2>
          <Link to="/books?sort=rating" className="text-sm" style={{ fontWeight: 600 }}>View all</Link>
        </div>
        {loading ? <BookSkeletonGrid count={4} /> : (
          <div className="grid-books">{featured.map(b => <BookCard key={b.id} book={b} />)}</div>
        )}
      </section>

      {/* Popular */}
      <section className="container" style={{ marginTop: 56 }}>
        <div className="flex-between mb-24">
          <h2>Popular Books</h2>
          <Link to="/books?sort=popular" className="text-sm" style={{ fontWeight: 600 }}>View all</Link>
        </div>
        {loading ? <BookSkeletonGrid count={4} /> : (
          <div className="grid-books">{popular.map(b => <BookCard key={b.id} book={b} />)}</div>
        )}
      </section>

      {/* Recently added */}
      <section className="container" style={{ margin: '56px auto 70px' }}>
        <div className="flex-between mb-24">
          <h2>Recently Added</h2>
          <Link to="/books?sort=recent" className="text-sm" style={{ fontWeight: 600 }}>View all</Link>
        </div>
        {loading ? <BookSkeletonGrid count={8} /> : (
          <div className="grid-books">{recent.map(b => <BookCard key={b.id} book={b} />)}</div>
        )}
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-blue-light)', padding: '50px 0' }}>
        <div className="container flex-between" style={{ flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ margin: 0 }}><Sparkles size={20} style={{ verticalAlign: -3 }} color="var(--color-amber)" /> Get personalized picks</h3>
            <p className="muted" style={{ margin: '6px 0 0' }}>Create an account to unlock recommendations, wishlists, and due-date reminders.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Create free account</Link>
        </div>
      </section>
    </div>
  );
}
