import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ZoomIn, ZoomOut, Maximize, Minimize, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import api, { fileUrl } from '../../services/api';
import { LoadingState, ErrorState } from '../../components/StateViews';

export default function EBookReader() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/books/${id}`);
        if (cancelled) return;
        if (!data.book.ebook_file) {
          setError('This book does not have an e-book available.');
          return;
        }
        setBook(data.book);

        // Resume from last-read page if we have history
        try {
          const histRes = await api.get('/reading-history');
          const existing = histRes.data.history.find(h => h.book_id === data.book.id);
          if (existing) setPage(existing.last_page || 1);
        } catch {}
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load this e-book. You may need to log in.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const saveProgress = useCallback((newPage, progressPct) => {
    if (!book) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.post('/reading-history', { book_id: book.id, progress: progressPct, last_page: newPage }).catch(() => {});
    }, 600);
  }, [book]);

  const changePage = (delta) => {
    const next = Math.max(1, page + delta);
    setPage(next);
    // Progress is approximate without a page-count field; nudge upward capped at 100.
    const approxProgress = Math.min(100, next * 4);
    saveProgress(next, approxProgress);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(f => !f);
  };

  if (loading) return <LoadingState label="Opening e-book…" />;
  if (error) return (
    <div className="container" style={{ padding: 60 }}>
      <ErrorState title="Unable to open e-book" message={error} />
      <div className="flex-center mt-16"><Link to="/books" className="btn btn-outline btn-sm">Back to Books</Link></div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ background: '#2B333F', minHeight: '100vh' }}>
      <div className="flex-between" style={{ padding: '14px 20px', background: '#1F2733', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <BookOpen size={17} />
          <strong style={{ fontSize: '0.92rem' }}>{book.title}</strong>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut size={15} /></button>
          <span className="text-sm" style={{ minWidth: 42, textAlign: 'center' }}>{zoom}%</span>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn size={15} /></button>
          <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>
        </div>
      </div>

      <div className="flex-center" style={{ padding: '30px 16px' }}>
        <iframe
          title={book.title}
          src={`${fileUrl(book.ebook_file)}#page=${page}`}
          style={{
            width: `${zoom}%`, maxWidth: 900, height: '75vh', border: 'none',
            background: '#fff', borderRadius: 8, boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
          }}
        />
      </div>

      <div className="flex-center gap-16" style={{ padding: '0 0 30px', color: '#fff' }}>
        <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => changePage(-1)} disabled={page <= 1}>
          <ArrowLeft size={15} /> Previous
        </button>
        <span className="text-sm">Page {page}</span>
        <button className="btn btn-ghost btn-sm" style={{ color: '#fff' }} onClick={() => changePage(1)}>
          Next <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
