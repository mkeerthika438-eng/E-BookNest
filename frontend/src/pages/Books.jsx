import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { BookSkeletonGrid, EmptyState, ErrorState } from '../components/StateViews';

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const availability = searchParams.get('availability') || '';
  const ebook = searchParams.get('ebook') || '';
  const sort = searchParams.get('sort') || 'recent';
  const page = searchParams.get('page') || '1';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/books', { params: { search, category, availability, ebook, sort, page, limit: 12 } })
      .then(res => {
        setBooks(res.data.books);
        setPagination(res.data.pagination);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, category, availability, ebook, sort, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api.get('/books/categories/list').then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || availability || ebook || search;

  return (
    <div className="container" style={{ padding: '32px 24px 60px' }}>
      <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Browse Books</h2>
          {search && <p className="muted text-sm" style={{ margin: '4px 0 0' }}>Results for "{search}"</p>}
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setShowFilters(s => !s)}>
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="card mb-24" style={{ padding: 18, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="text-sm" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
            <select className="input" value={category} onChange={(e) => updateParam('category', e.target.value)} style={{ minWidth: 170 }}>
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Availability</label>
            <select className="input" value={availability} onChange={(e) => updateParam('availability', e.target.value)} style={{ minWidth: 150 }}>
              <option value="">All</option>
              <option value="available">Available now</option>
            </select>
          </div>
          <div>
            <label className="text-sm" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>E-book</label>
            <select className="input" value={ebook} onChange={(e) => updateParam('ebook', e.target.value)} style={{ minWidth: 150 }}>
              <option value="">Any</option>
              <option value="true">E-book available</option>
            </select>
          </div>
          <div>
            <label className="text-sm" style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Sort by</label>
            <select className="input" value={sort} onChange={(e) => updateParam('sort', e.target.value)} style={{ minWidth: 170 }}>
              <option value="recent">Recently added</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
              <option value="popular">Most popular</option>
              <option value="rating">Highest rated</option>
            </select>
          </div>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={14} /> Clear all</button>
          )}
        </div>
      )}

      {loading && <BookSkeletonGrid count={12} />}
      {!loading && error && <ErrorState message="Could not load books. Check that the backend server is running." onRetry={load} />}
      {!loading && !error && books.length === 0 && (
        <EmptyState title="No books found" message="Try a different search term or clear your filters." />
      )}
      {!loading && !error && books.length > 0 && (
        <>
          <div className="grid-books">{books.map(b => <BookCard key={b.id} book={b} />)}</div>
          {pagination.totalPages > 1 && (
            <div className="flex-center gap-8 mt-32">
              <button className="btn btn-ghost btn-sm" disabled={pagination.page <= 1}
                onClick={() => updateParam('page', String(pagination.page - 1))}>Previous</button>
              <span className="text-sm muted">Page {pagination.page} of {pagination.totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateParam('page', String(pagination.page + 1))}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
