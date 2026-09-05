import { BookX, AlertTriangle, Inbox } from 'lucide-react';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p className="mt-16 text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message = '', action = null }) {
  return (
    <div className="state-box">
      <Icon size={40} strokeWidth={1.4} color="var(--color-blue-mid)" />
      <h3 className="mt-16">{title}</h3>
      {message && <p className="text-sm">{message}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again.', onRetry }) {
  return (
    <div className="state-box">
      <AlertTriangle size={40} strokeWidth={1.4} color="var(--color-danger)" />
      <h3 className="mt-16">{title}</h3>
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm mt-16" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

export function BookSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid-books">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: 'hidden' }}>
          <div className="skeleton" style={{ height: 180 }} />
          <div style={{ padding: 14 }}>
            <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export { BookX };
