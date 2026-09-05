import { useEffect, useState } from 'react';
import { QrCode, Download, Printer, Search } from 'lucide-react';
import api, { fileUrl } from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function QRManagement() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/books', { params: { search, limit: 50 } })
      .then(res => setBooks(res.data.books))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [search]);

  const printQr = (book) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${book.title} — QR</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px;">
        <h3>${book.title}</h3>
        <p>${book.book_id}</p>
        <img src="${fileUrl(book.qr_code)}" style="width:260px;" />
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div>
      <h2><QrCode size={20} style={{ verticalAlign: -3 }} /> QR Code Management</h2>
      <p className="muted mb-16">Every book's QR code, ready to view, download, or print.</p>

      <div style={{ position: 'relative', maxWidth: 320, marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-ink-soft)' }} />
        <input className="input" style={{ paddingLeft: 34 }} placeholder="Search books…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && books.length === 0 && <EmptyState title="No books found" />}

      <div className="grid-books" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
        {books.map(b => (
          <div key={b.id} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, marginBottom: 10 }}>
              {b.qr_code
                ? <img src={fileUrl(b.qr_code)} alt="QR" style={{ width: '100%' }} />
                : <div className="text-sm muted" style={{ padding: 30 }}>No QR generated</div>}
            </div>
            <strong className="text-sm">{b.title}</strong>
            <div className="text-sm muted">{b.book_id}</div>
            {b.qr_code && (
              <div className="flex-center gap-8 mt-16">
                <a href={fileUrl(b.qr_code)} download className="btn btn-ghost btn-sm"><Download size={13} /></a>
                <button className="btn btn-ghost btn-sm" onClick={() => printQr(b)}><Printer size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
