import { Link } from 'react-router-dom';
import { BookX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', textAlign: 'center', padding: 24 }}>
      <BookX size={52} color="var(--color-blue-mid)" strokeWidth={1.3} />
      <h2 className="mt-16">Page not found</h2>
      <p className="muted">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-16">Back to Home</Link>
    </div>
  );
}
