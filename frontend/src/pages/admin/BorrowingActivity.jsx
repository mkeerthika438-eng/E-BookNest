import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ClipboardList, CheckCircle, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, EmptyState, ErrorState } from '../../components/StateViews';

export default function BorrowingActivity() {
  const [borrowings, setBorrowings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/borrowings').then(res => setBorrowings(res.data.borrowings)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const isOverdue = (b) => b.status === 'active' && new Date(b.due_date) < new Date();

  const markReturned = async (id) => {
    setBusyId(id);
    try {
      const { data } = await api.put(`/borrowings/${id}/return`);
      if (data.fineAmount > 0) {
        toast.success(`Returned. Late fine of ₹${data.fineAmount} applied.`);
      } else {
        toast.success('Marked as returned.');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update record.');
    } finally { setBusyId(null); }
  };

  const markFinePaid = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/borrowings/${id}/pay-fine`);
      toast.success('Fine marked as paid.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update fine.');
    } finally { setBusyId(null); }
  };

  const filtered = borrowings.filter(b => {
    if (filter === 'active') return b.status === 'active';
    if (filter === 'overdue') return isOverdue(b);
    if (filter === 'returned') return b.status === 'returned';
    if (filter === 'unpaid_fines') return Number(b.fine_amount) > 0 && !b.fine_paid;
    return true;
  });

  return (
    <div>
      <h2><ClipboardList size={20} style={{ verticalAlign: -3 }} /> Borrowing Activity</h2>
      <p className="muted mb-16">All borrow records across the library.</p>

      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        {['all', 'active', 'overdue', 'returned', 'unpaid_fines'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === 'unpaid_fines' ? 'Unpaid Fines' : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingState />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && filtered.length === 0 && <EmptyState title="No records found" />}

      {!loading && !error && filtered.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-blue-light)', textAlign: 'left' }}>
                <Th>Book</Th><Th>User</Th><Th>Borrowed</Th><Th>Due</Th><Th>Status</Th><Th>Fine</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <Td><strong>{b.title}</strong><div className="text-sm muted">{b.book_code}</div></Td>
                  <Td>{b.user_name}<div className="text-sm muted">{b.email}</div></Td>
                  <Td>{new Date(b.borrowed_at).toLocaleDateString()}</Td>
                  <Td>{b.due_date}</Td>
                  <Td>
                    {b.status === 'returned'
                      ? <span className="badge badge-success">Returned</span>
                      : isOverdue(b) ? <span className="badge badge-danger">Overdue</span> : <span className="badge badge-amber">Active</span>}
                  </Td>
                  <Td>
                    {b.status === 'active' && b.live_fine > 0 && (
                      <span className="badge badge-danger">₹{b.live_fine} accruing</span>
                    )}
                    {b.status === 'returned' && Number(b.fine_amount) > 0 && (
                      <span className={`badge ${b.fine_paid ? 'badge-success' : 'badge-danger'}`}>
                        ₹{b.fine_amount} {b.fine_paid ? '(Paid)' : '(Unpaid)'}
                      </span>
                    )}
                    {(b.status === 'active' ? !b.live_fine : Number(b.fine_amount) === 0) && <span className="text-sm muted">—</span>}
                  </Td>
                  <Td>
                    <div className="flex gap-8">
                      {b.status === 'active' && (
                        <button className="btn btn-ghost btn-sm" disabled={busyId === b.id} onClick={() => markReturned(b.id)}>
                          <CheckCircle size={13} /> Mark Returned
                        </button>
                      )}
                      {b.status === 'returned' && Number(b.fine_amount) > 0 && !b.fine_paid && (
                        <button className="btn btn-ghost btn-sm" disabled={busyId === b.id} onClick={() => markFinePaid(b.id)}>
                          <IndianRupee size={13} /> Mark Fine Paid
                        </button>
                      )}
                    </div>
                  </Td>
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
