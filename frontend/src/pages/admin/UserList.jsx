import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/users').then(res => setUsers(res.data.users)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <h2><Users size={20} style={{ verticalAlign: -3 }} /> Registered Users</h2>
      <p className="muted mb-24">All students registered on the platform.</p>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && users.length === 0 && <EmptyState title="No users yet" />}

      {!loading && !error && users.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-blue-light)', textAlign: 'left' }}>
                <Th>Name</Th><Th>Email</Th><Th>College ID</Th><Th>Currently Borrowed</Th><Th>Total Borrowed</Th><Th>Joined</Th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Td><strong>{u.name}</strong></Td>
                  <Td>{u.email}</Td>
                  <Td>{u.college_id}</Td>
                  <Td>{u.currently_borrowed}</Td>
                  <Td>{u.total_borrowed}</Td>
                  <Td>{new Date(u.created_at).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }) => <th style={{ padding: '10px 16px', fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: '10px 16px', fontSize: '0.88rem' }}>{children}</td>;
