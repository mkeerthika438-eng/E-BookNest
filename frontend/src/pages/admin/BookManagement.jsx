import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, Library } from 'lucide-react';
import api, { fileUrl } from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const navigate = useNavigate();

  const load = (page = 1) => {
    setLoading(true);
    setError(false);
    api.get('/books', { params: { search, page, limit: 10, sort: 'recent' } })
      .then(res => { setBooks(res.data.books); setPagination(res.data.pagination); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [search]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted.');
      setConfirmId(null);
      load(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete book.');
    }
  };

  return (
    <div>
      <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Book Management</h2>
          <p className="muted" style={{ margin: 0 }}>Add, edit, and remove books from the catalog.</p>
        </div>
        <Link to="/admin/books/add" className="btn btn-primary"><Plus size={16} /> Add Book</Link>
      </div>

      <div style={{ position: 'relative', maxWidth: 340, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-ink-soft)' }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search books…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={() => load(1)} />}
      {!loading && !error && books.length === 0 && <EmptyState title="No books found" />}

      {!loading && !error && books.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-blue-light)', textAlign: 'left' }}>
                <Th></Th><Th>Title</Th><Th>Author</Th><Th>Category</Th><Th>Copies</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Td>
                    <div style={{ width: 36, height: 48, background: 'var(--color-blue-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {b.cover_image ? <img src={fileUrl(b.cover_image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Library size={14} color="var(--color-blue-mid)" />}
                    </div>
                  </Td>
                  <Td><strong>{b.title}</strong><div className="text-sm muted">{b.book_id}</div></Td>
                  <Td>{b.author}</Td>
                  <Td>{b.category}</Td>
                  <Td>{b.available_copies}/{b.total_copies}</Td>
                  <Td>
                    <div className="flex gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/books/edit/${b.id}`)}><Pencil size={13} /></button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setConfirmId(b.id)}><Trash2 size={13} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex-center gap-8 mt-24">
          <button className="btn btn-ghost btn-sm" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>Previous</button>
          <span className="text-sm muted">Page {pagination.page} of {pagination.totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => load(pagination.page + 1)}>Next</button>
        </div>
      )}

      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,42,82,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ padding: 26, maxWidth: 340 }}>
            <h3>Delete this book?</h3>
            <p className="text-sm muted">This cannot be undone. Books with active borrowings can't be deleted.</p>
            <div className="flex gap-8 mt-16">
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(confirmId)}>Delete</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }) => <th style={{ padding: '10px 16px', fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: '10px 16px', fontSize: '0.88rem' }}>{children}</td>;
