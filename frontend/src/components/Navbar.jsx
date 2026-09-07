import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookMarked,
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  ScanLine,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    api.get('/notifications')
      .then(res => {
        if (active) setUnread(res.data.unreadCount || 0);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    navigate(`/books?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <BookMarked size={26} />
          <span>E-BookNest</span>
        </Link>

        {/* Desktop Search */}
        <form onSubmit={submitSearch} className="navbar-search">
          <div className="navbar-search-box">
            <Search size={16} />
            <input
              className="input"
              placeholder="Search title, author, ISBN, Book ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <nav className="navbar-desktop-nav">

          {!user && (
            <>
              <Link to="/books" className="btn btn-ghost btn-sm">
                Browse
              </Link>

              <Link to="/login" className="btn btn-outline btn-sm">
                Log in
              </Link>

              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to="/qr-scanner"
                className="btn btn-ghost btn-sm"
                title="Scan QR"
              >
                <ScanLine size={17} />
              </Link>

              <Link
                to="/notifications"
                className="btn btn-ghost btn-sm navbar-icon-btn"
                title="Notifications"
              >
                <Bell size={17} />

                {unread > 0 && (
                  <span className="notification-badge">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="btn btn-ghost btn-sm"
                title="Dashboard"
              >
                <LayoutDashboard size={17} />
              </Link>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMenuOpen(prev => !prev)}
              >
                <User size={17} />
                {user.name?.split(' ')[0]}
              </button>
            </>
          )}

        </nav>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-btn btn btn-ghost btn-sm"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">

          {/* Mobile Search */}
          <form onSubmit={submitSearch} className="mobile-search-form">
            <div className="navbar-search-box">
              <Search size={16} />

              <input
                className="input"
                placeholder="Search books..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {!user && (
            <div className="mobile-menu-links">
              <Link to="/books" className="mobile-menu-link">
                Browse Books
              </Link>

              <Link to="/login" className="mobile-menu-link">
                Log in
              </Link>

              <Link to="/register" className="mobile-menu-link mobile-signup">
                Sign up
              </Link>
            </div>
          )}

          {user && (
            <div className="mobile-menu-links">

              <Link to="/qr-scanner" className="mobile-menu-link">
                <ScanLine size={18} />
                Scan QR
              </Link>

              <Link to="/notifications" className="mobile-menu-link">
                <Bell size={18} />
                Notifications
                {unread > 0 && (
                  <span className="mobile-notification-count">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="mobile-menu-link"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              <Link to="/profile" className="mobile-menu-link">
                <User size={18} />
                Profile
              </Link>

              <button
                className="mobile-menu-link mobile-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Log out
              </button>

            </div>
          )}

        </div>
      )}
    </header>
  );
}