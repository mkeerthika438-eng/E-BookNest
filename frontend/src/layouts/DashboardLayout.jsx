import { NavLink, Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  LayoutDashboard, ScanLine, BookCopy, RefreshCw, Heart, History,
  Sparkles, Bell, UserCircle, Library, PlusSquare, QrCode, Users,
  ClipboardList, RotateCcw, MessageSquare, FileBarChart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/qr-scanner', label: 'QR Scanner', icon: ScanLine },
  { to: '/my-books', label: 'My Books', icon: BookCopy },
  { to: '/renewals', label: 'Renewals', icon: RefreshCw },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/reading-history', label: 'Reading History', icon: History },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/books', label: 'Book Management', icon: Library },
  { to: '/admin/books/add', label: 'Add Book', icon: PlusSquare },
  { to: '/admin/qr', label: 'QR Management', icon: QrCode },
  { to: '/admin/users', label: 'User List', icon: Users },
  { to: '/admin/borrowings', label: 'Borrowing Activity', icon: ClipboardList },
  { to: '/admin/renewals', label: 'Renewal Activity', icon: RotateCcw },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
];

export default function DashboardLayout() {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      <Navbar />
      <div className="container" style={{ display: 'flex', gap: 28, alignItems: 'flex-start', padding: '28px 24px 60px' }}>
        <aside className="card dash-sidebar" style={{ width: 230, flexShrink: 0, padding: 12, position: 'sticky', top: 84 }}>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </aside>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
      <style>{`
        .sidebar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--color-ink-soft); font-size: 0.9rem; font-weight: 500;
          margin-bottom: 2px;
        }
        .sidebar-link:hover { background: var(--color-blue-light); text-decoration: none; }
        .sidebar-link.active { background: var(--color-blue); color: #fff; }
        @media (max-width: 800px) {
          .dash-sidebar { display: flex; overflow-x: auto; width: 100%; position: static; gap: 4px; }
          .sidebar-link { white-space: nowrap; }
        }
      `}</style>
    </>
  );
}