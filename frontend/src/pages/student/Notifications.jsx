import { useEffect, useState } from 'react';
import { Bell, CheckCheck, AlertCircle, RefreshCw, BookPlus, Heart, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

const TYPE_ICON = {
  due_soon: AlertCircle,
  overdue: AlertCircle,
  renewal: RefreshCw,
  new_book: BookPlus,
  wishlist_available: Heart,
  recommendation: Sparkles,
  general: Bell
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/notifications').then(res => setNotifications(res.data.notifications)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    api.put(`/notifications/${id}/read`).catch(() => {});
  };

  const markAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    api.put('/notifications/read-all').catch(() => {});
  };

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2><Bell size={20} style={{ verticalAlign: -3 }} /> Notifications</h2>
          <p className="muted" style={{ margin: 0 }}>Due dates, renewals, and updates.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}><CheckCheck size={14} /> Mark all read</button>
        )}
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && notifications.length === 0 && <EmptyState title="You're all caught up" message="No notifications right now." />}

      <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
        {notifications.map(n => {
          const Icon = TYPE_ICON[n.type] || Bell;
          return (
            <div
              key={n.id}
              className="card flex gap-12"
              style={{ padding: 16, alignItems: 'flex-start', background: n.is_read ? 'var(--color-white)' : 'var(--color-blue-light)', cursor: n.is_read ? 'default' : 'pointer' }}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <Icon size={18} color="var(--color-blue)" style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <strong className="text-sm">{n.title}</strong>
                  <span className="text-sm muted">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm muted" style={{ margin: '4px 0 0' }}>{n.message}</p>
              </div>
              {!n.is_read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-blue)', marginTop: 6 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
