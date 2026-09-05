import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-navy)', color: '#C9D6EC', marginTop: 60 }}>
      <div className="container" style={{ padding: '40px 24px 28px', display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 280 }}>
          <div className="flex" style={{ alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <BookMarked size={22} color="#fff" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>E-BookNest</span>
          </div>
          <p className="text-sm" style={{ color: '#9FB2D6' }}>
            A smart digital library platform for discovering, borrowing, and reading books — built for the modern campus.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 10 }}>Explore</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Link to="/books" style={{ color: '#9FB2D6' }}>Browse Books</Link>
            <Link to="/qr-scanner" style={{ color: '#9FB2D6' }}>Scan a Book</Link>
            <Link to="/about" style={{ color: '#9FB2D6' }}>About</Link>
            <Link to="/contact" style={{ color: '#9FB2D6' }}>Contact</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: 10 }}>Account</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Link to="/login" style={{ color: '#9FB2D6' }}>Log in</Link>
            <Link to="/register" style={{ color: '#9FB2D6' }}>Sign up</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #24406E', padding: '14px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#7E93BE' }}>
        © {new Date().getFullYear()} E-BookNest — Digital Library Platform. Final-year academic project.
      </div>
    </footer>
  );
}
