import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ScanLine, Keyboard, CameraOff, Library } from 'lucide-react';
import api, { fileUrl } from '../../services/api';

const SCANNER_ID = 'qr-reader';

export default function QRScanner() {
  const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
  const [cameraError, setCameraError] = useState(null);
  const [manualId, setManualId] = useState('');
  const [result, setResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode !== 'camera') return;
    let html5QrCode;
    let cancelled = false;

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      html5QrCode = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = html5QrCode;

      Html5Qrcode.getCameras().then(cameras => {
        if (!cameras || cameras.length === 0) {
          setCameraError('No camera hardware was found on this device.');
          return;
        }
        html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 240 },
          (decodedText) => handleScan(decodedText),
          () => {} // ignore per-frame scan failures
        ).catch(() => {
          setCameraError('Camera permission was denied or the camera is unavailable.');
        });
      }).catch(() => {
        setCameraError('Camera permission was denied or the camera is unavailable.');
      });
    });

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current.clear()).catch(() => {});
      }
    };
  }, [mode]);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
    }
  };

  const resolveBookId = async (bookId) => {
    setSearching(true);
    try {
      const { data } = await api.get(`/books/qr/${bookId}`);
      setResult(data.book);
      await stopCamera();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unknown Book ID. Please check and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleScan = (decodedText) => {
    let bookId = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.book_id) bookId = parsed.book_id;
    } catch {
      // plain-text QR containing just the book_id — used as-is
    }
    resolveBookId(bookId);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return toast.error('Enter a Book ID.');
    resolveBookId(manualId.trim());
  };

  const scanAgain = () => {
    setResult(null);
    setCameraError(null);
    setMode('camera');
  };

  return (
    <div>
      <h2>QR Book Scanner</h2>
      <p className="muted mb-24">Scan a book's QR code, or enter its Book ID manually.</p>

      {!result && (
        <div className="card" style={{ padding: 24, maxWidth: 480 }}>
          <div className="flex gap-8 mb-16">
            <button className={`btn btn-sm ${mode === 'camera' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('camera')}>
              <ScanLine size={14} /> Camera
            </button>
            <button className={`btn btn-sm ${mode === 'manual' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMode('manual')}>
              <Keyboard size={14} /> Enter Manually
            </button>
          </div>

          {mode === 'camera' && (
            <>
              {cameraError ? (
                <div className="state-box" style={{ padding: 30 }}>
                  <CameraOff size={34} color="var(--color-danger)" />
                  <p className="text-sm mt-16">{cameraError}</p>
                  <button className="btn btn-outline btn-sm mt-16" onClick={() => setMode('manual')}>Enter Book ID instead</button>
                </div>
              ) : (
                <div id={SCANNER_ID} style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }} />
              )}
            </>
          )}

          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit}>
              <div className="field">
                <label>Book ID</label>
                <input className="input" placeholder="e.g. BK001" value={manualId} onChange={(e) => setManualId(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-block" disabled={searching}>
                {searching ? 'Looking up…' : 'Find Book'}
              </button>
            </form>
          )}
        </div>
      )}

      {result && (
        <div className="card mt-24" style={{ padding: 24, maxWidth: 480, display: 'flex', gap: 16 }}>
          <div style={{ width: 90, height: 120, background: 'var(--color-blue-light)', borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {result.cover_image
              ? <img src={fileUrl(result.cover_image)} alt={result.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Library size={28} color="var(--color-blue-mid)" />}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px' }}>{result.title}</h4>
            <p className="text-sm muted" style={{ margin: '0 0 8px' }}>{result.author}</p>
            <span className={`badge ${result.available_copies > 0 ? 'badge-success' : 'badge-danger'}`}>
              {result.available_copies > 0 ? 'Available' : 'Unavailable'}
            </span>
            {result.ebook_file && <span className="badge badge-blue" style={{ marginLeft: 6 }}>E-book</span>}
            <div className="flex gap-8 mt-16">
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/books/${result.book_id}`)}>View Details</button>
              <button className="btn btn-ghost btn-sm" onClick={scanAgain}>Scan Another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
