import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookMarked, Search, Bell, Menu, X, LayoutDashboard, ScanLine, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    api.get('/notifications').then(res => {
      if (active) setUnread(res.data.unreadCount || 0);
    }).catch(() => {});
    return () => { active = false; };
  }, [user, location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="container flex-between" style={{ height: 68 }}>
        <Link to="/" className="flex" style={{ alignItems: 'center', gap: 8 }}>
          <BookMarked size={26} color="var(--color-blue)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem', color: 'var(--color-navy)' }}>
            E-BookNest
          </span>
        </Link>

        <form onSubmit={submitSearch} className="flex navbar-search" style={{ flex: 1, maxWidth: 420, margin: '0 24px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: 'var(--color-ink-soft)' }} />
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="Search title, author, ISBN, Book ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <nav className="flex" style={{ alignItems: 'center', gap: 8 }}>
          {!user && (
            <>
              <Link to="/books" className="btn btn-ghost btn-sm">Browse</Link>
              <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/qr-scanner" className="btn btn-ghost btn-sm" title="Scan QR">
                <ScanLine size={17} />
              </Link>
              <Link to="/notifications" className="btn btn-ghost btn-sm" style={{ position: 'relative' }} title="Notifications">
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, background: 'var(--color-danger)',
                    color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999,
                    minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{unread > 9 ? '9+' : unread}</span>
                )}
              </Link>
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn btn-ghost btn-sm" title="Dashboard">
                <LayoutDashboard size={17} />
              </Link>
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(o => !o)}>
                  <User size={17} /> {user.name?.split(' ')[0]}
                </button>
                {menuOpen && (
                  <div className="card" style={{ position: 'absolute', right: 0, top: 42, minWidth: 170, padding: 8, zIndex: 50 }}>
                    <Link to="/profile" className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start' }}>Profile</Link>
                    <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: 'flex-start', color: 'var(--color-danger)' }} onClick={handleLogout}>
                      <LogOut size={15} /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button className="btn btn-ghost btn-sm" style={{ display: 'none' }}><Menu size={18} /></button>
        </nav>
      </div>
    </header>
  );
}
