import { BookMarked, ScanLine, Heart, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="container" style={{ padding: '48px 24px 70px', maxWidth: 780 }}>
      <span className="badge badge-blue mb-16">About the platform</span>
      <h1>Built for how students actually read</h1>
      <p className="muted" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
        E-BookNest is a digital library platform designed to make campus book collections easier to search, borrow,
        and read. Instead of paper logs and manual lookups, students can scan a book's QR code for instant details,
        renew loans before they're due, and pick up right where they left off in an e-book.
      </p>

      <div className="grid-books mt-32" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Feature icon={ScanLine} title="Scan & Discover" text="Point a camera at any book's QR code to pull up its details instantly." />
        <Feature icon={BookMarked} title="Read Anywhere" text="Available e-books open right in the browser, with your progress saved." />
        <Feature icon={Heart} title="Personal Shelf" text="Wishlist titles, track history, and rate what you've read." />
        <Feature icon={Sparkles} title="Smart Picks" text="Recommendations based on your borrowing and rating patterns." />
      </div>

      <div className="mt-32">
        <h3>Our mission</h3>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          We built E-BookNest to remove the friction between students and the books their library already owns —
          faster discovery, fewer missed due dates, and a reading experience that fits how people actually study today.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <Icon size={22} color="var(--color-blue)" />
      <h4 style={{ margin: '12px 0 6px', fontSize: '1rem' }}>{title}</h4>
      <p className="text-sm muted" style={{ margin: 0 }}>{text}</p>
    </div>
  );
}
