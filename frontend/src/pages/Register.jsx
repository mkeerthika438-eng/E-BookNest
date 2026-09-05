import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BookMarked } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialForm = { name: '', email: '', phone: '', college_id: '', password: '', confirm_password: '' };

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to E-BookNest.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '85vh', padding: '40px 16px' }}>
      <div className="card" style={{ width: 440, padding: 32 }}>
        <div className="flex-center gap-8" style={{ marginBottom: 22 }}>
          <BookMarked size={26} color="var(--color-blue)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--color-navy)' }}>E-BookNest</span>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 4 }}>Create your account</h2>
        <p className="muted text-sm" style={{ textAlign: 'center', marginBottom: 24 }}>Join your campus digital library</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input className="input" required value={form.name} onChange={update('name')} placeholder="Jordan Lee" />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={update('email')} placeholder="you@college.edu" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input className="input" required value={form.phone} onChange={update('phone')} placeholder="9876543210" />
          </div>
          <div className="field">
            <label>College ID</label>
            <input className="input" required value={form.college_id} onChange={update('college_id')} placeholder="STU2026045" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input className="input" type="password" required value={form.confirm_password} onChange={update('confirm_password')} placeholder="Re-enter password" />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="text-sm muted" style={{ textAlign: 'center', marginTop: 18 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
