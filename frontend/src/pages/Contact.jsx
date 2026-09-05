import { useState } from 'react';
import { toast } from 'react-toastify';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! The library team will get back to you soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container" style={{ padding: '48px 24px 70px' }}>
      <h1>Contact the Library Team</h1>
      <p className="muted" style={{ maxWidth: 520 }}>Questions about a book, your account, or the platform itself? Reach out below.</p>

      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginTop: 32 }}>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 26, flex: 1, minWidth: 280, maxWidth: 460 }}>
          <div className="field">
            <label>Name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea className="input" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-block">Send Message</button>
        </form>

        <div style={{ flex: 1, minWidth: 240 }}>
          <ContactRow icon={Mail} label="Email" value="library@ebooknest.edu" />
          <ContactRow icon={Phone} label="Phone" value="+1 (555) 010-2026" />
          <ContactRow icon={MapPin} label="Location" value="Central Library, Main Campus, Block C" />
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-12 mb-24" style={{ alignItems: 'flex-start' }}>
      <div style={{ background: 'var(--color-blue-light)', padding: 10, borderRadius: 10 }}>
        <Icon size={18} color="var(--color-blue)" />
      </div>
      <div>
        <div className="text-sm muted">{label}</div>
        <div style={{ fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
