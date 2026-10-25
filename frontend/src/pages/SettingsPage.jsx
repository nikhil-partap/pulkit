import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, GraduationCap, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const emptyProfile = { name: '', email: '', college: '', course: '', availability: 'Weekdays', company: '', jobTitle: '', industry: '' };

export default function SettingsPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const homePath = user?.role === 'Recruiter' ? '/recruiter' : '/student';
  const isRecruiter = user?.role === 'Recruiter';

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (location.state?.from && typeof location.state.from === 'string' && location.state.from.startsWith('/')) {
      navigate(location.state.from, { state: { activePage: location.state.activePage } });
      return;
    }
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    navigate(homePath);
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  useEffect(() => {
    if (!user?.id) return;
    api.getProfile(user.id, user.role)
      .then((data) => setProfile({ ...emptyProfile, ...data }))
      .catch((err) => { setIsError(true); setMessage(err.message || 'Could not load your profile.'); })
      .finally(() => setLoading(false));
  }, [user?.id, user?.role]);

  const updateField = (field, value) => setProfile((previous) => ({ ...previous, [field]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!profile.name.trim() || !profile.email.trim()) {
      setIsError(true);
      setMessage('Please complete your name and email fields.');
      return;
    }

    if (!isValidEmail(profile.email)) {
      setIsError(true);
      setMessage('Email must contain @ and a dot after it.');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await api.updateProfile({ userId: user.id, role: user.role, profile });
      login(updatedUser);
      window.dispatchEvent(new CustomEvent('kairos_profile_updated', { detail: updatedUser }));
      setIsError(false);
      setMessage('Profile updated.');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return <div className="settings-page">
    <header className="settings-topbar">
      <Link to={homePath} className="dashboard-brand">
        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos" className="dashboard-brand-logo-img" />
        <span>Kairos<span className="brand-dot">.</span></span>
      </Link>
      <button type="button" className="settings-back-btn" onClick={handleBack}><ArrowLeft size={16} />{location.state?.fromName ? `Back to ${location.state.fromName}` : 'Back to workspace'}</button>
    </header>
    <main className="settings-content">
      <section className="settings-intro">
        <span className="settings-icon">{isRecruiter ? <Building2 size={22} /> : <GraduationCap size={22} />}</span>
        <div><p className="small-heading">WORKSPACE SETTINGS</p><h1>Settings</h1><p>Manage your profile details in one place.</p></div>
      </section>
      <form className="settings-form" onSubmit={handleSave}>
        {loading ? <p className="settings-loading">Loading profile...</p> : <>
          <div className="settings-form-section"><h2>Edit profile</h2>
            <div className="settings-field-grid">
              <label>Full name<input value={profile.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
              <label>Email address<input type="email" value={profile.email} onChange={(event) => updateField('email', event.target.value)} required /></label>
            </div>
          </div>
          {isRecruiter ? <div className="settings-form-section"><h2>Company details</h2>
            <div className="settings-field-grid">
              <label>Company name<input value={profile.company} onChange={(event) => updateField('company', event.target.value)} required /></label>
              <label>Your job title<input value={profile.jobTitle} onChange={(event) => updateField('jobTitle', event.target.value)} required /></label>
              <label>Industry<select value={profile.industry} onChange={(event) => updateField('industry', event.target.value)}><option>Technology</option><option>Retail</option><option>Food & hospitality</option><option>Education</option><option>Other</option></select></label>
            </div>
          </div> : <div className="settings-form-section"><h2>Academic details</h2>
            <div className="settings-field-grid">
              <label>College or university<input value={profile.college} onChange={(event) => updateField('college', event.target.value)} required /></label>
              <label>Course<input value={profile.course} onChange={(event) => updateField('course', event.target.value)} required /></label>
              <label>Availability<select value={profile.availability} onChange={(event) => updateField('availability', event.target.value)}><option>Weekdays</option><option>Weekends</option><option>Both</option></select></label>
            </div>
          </div>}
          {message && <p className={`settings-message ${isError ? 'error' : 'success'}`}>{message}</p>}
          <div className="settings-actions"><button type="submit" className="settings-save-btn" disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button></div>
        </>}
      </form>
    </main>
  </div>;
}
