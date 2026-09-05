import { useEffect, useState } from 'react';
import { UserCircle, Mail, Phone, Contact as IdCard, Calendar } from 'lucide-react';
import api from '../../services/api';
import { LoadingState, ErrorState } from '../../components/StateViews';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get('/auth/me').then(res => setProfile(res.data.user)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div>
      <h2>My Profile</h2>
      <p className="muted mb-24">Your account details on E-BookNest.</p>

      <div className="card" style={{ padding: 28, maxWidth: 480 }}>
        <div className="flex gap-16" style={{ alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={36} color="var(--color-blue)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{profile.name}</h3>
            <span className="badge badge-blue">{profile.role}</span>
          </div>
        </div>

        <ProfileRow icon={Mail} label="Email" value={profile.email} />
        <ProfileRow icon={Phone} label="Phone" value={profile.phone} />
        <ProfileRow icon={IdCard} label="College ID" value={profile.college_id} />
        <ProfileRow icon={Calendar} label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-12 mb-16" style={{ alignItems: 'center' }}>
      <Icon size={16} color="var(--color-blue-mid)" />
      <div>
        <div className="text-sm muted" style={{ fontSize: '0.72rem' }}>{label}</div>
        <div style={{ fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
