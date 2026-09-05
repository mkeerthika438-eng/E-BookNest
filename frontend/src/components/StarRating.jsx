import { Star } from 'lucide-react';

export default function StarRating({ value = 0, size = 15, showValue = false, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="flex" style={{ alignItems: 'center', gap: 2 }}>
      {stars.map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= Math.round(value) ? 'var(--color-amber)' : 'none'}
          color="var(--color-amber)"
          strokeWidth={1.5}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onChange && onChange(s)}
        />
      ))}
      {showValue && <span className="text-sm muted" style={{ marginLeft: 4 }}>{Number(value).toFixed(1)}</span>}
    </span>
  );
}
