import { useEffect, useState } from 'react';
import api from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function Renewals() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/renewals/my').then(res => setRenewals(res.data.renewals)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <h2>Renewal History</h2>
      <p className="muted mb-24">Every time you've extended a due date.</p>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && renewals.length === 0 && (
        <EmptyState title="No renewals yet" message="Renew a borrowed book before its due date to see history here." />
      )}

      {!loading && !error && renewals.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-blue-light)', textAlign: 'left' }}>
                <Th>Book</Th><Th>Renewal #</Th><Th>Old Due Date</Th><Th>New Due Date</Th><Th>Renewed On</Th>
              </tr>
            </thead>
            <tbody>
              {renewals.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Td>{r.title}</Td>
                  <Td>{r.renewal_number}</Td>
                  <Td>{r.old_due_date}</Td>
                  <Td>{r.new_due_date}</Td>
                  <Td>{new Date(r.renewed_at).toLocaleDateString()}</Td>
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
