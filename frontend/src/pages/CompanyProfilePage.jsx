import React, { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Building2, Mail, MapPin, RefreshCw, UserRound } from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

export default function CompanyProfilePage() {
  const { recruiterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    if (location.state?.from && typeof location.state.from === 'string' && location.state.from.startsWith('/')) {
      navigate(location.state.from);
      return;
    }
    navigate('/student');
  };

  useEffect(() => {
    setLoading(true);
    api.getRecruiterCompanyProfile(recruiterId).then(setCompany).catch((requestError) => setError(requestError.message || 'Could not load this company.')).finally(() => setLoading(false));
  }, [recruiterId]);

  const backLabel = location.state?.fromName ? `Back to ${location.state.fromName}` : 'Back to opportunities';

  return <div className="dashboard-screen"><Navbar workspaceLabel="Company profile" /><main className="company-profile-page">
    <button type="button" className="back-to-jobs" onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}><ArrowLeft size={16} /> {backLabel}</button>
    {loading ? <div className="profile-loading"><RefreshCw className="spin-icon" size={25} /><p>Loading company profile...</p></div> : error ? <div className="profile-loading"><h1>Company unavailable</h1><p>{error}</p><button type="button" className="session-save-button" onClick={handleBack}>{backLabel}</button></div> : <><section className="company-profile-hero"><div className="company-profile-logo"><Building2 size={34} /></div><div><p className="small-heading">VERIFIED EMPLOYER</p><h1>{company.company}</h1><p>{company.industry} · {company.activeRoles.length} live opportunity{company.activeRoles.length === 1 ? '' : 'ies'}</p></div></section>
      <section className="company-profile-grid"><article className="profile-card"><p className="small-heading">ABOUT THIS EMPLOYER</p><h2>Roles made for student schedules.</h2><p className="profile-bio">{company.company} is hiring students for flexible, practical work. Review the opportunity details and contact information before applying.</p><div className="company-contact"><UserRound size={18} /><div><strong>{company.contactName}</strong><span>{company.contactRole}</span></div><Mail size={17} /><a href={`mailto:${company.email}`}>{company.email}</a></div></article><aside className="profile-card"><p className="small-heading">OPEN OPPORTUNITIES</p><h2>Current roles</h2><div className="company-role-list">{company.activeRoles.length ? company.activeRoles.map((role) => <Link key={role.id} to={`/jobs/${role.id}`} state={{ from: '/student', fromName: 'Job opportunities' }}><BriefcaseBusiness size={16} /><span><strong>{role.title}</strong><small>{role.type} · {role.hours}</small></span><span className="company-role-pay">₹{role.pay}/hr</span></Link>) : <p>No active roles right now.</p>}</div></aside></section>
    </>}
  </main></div>;
}
