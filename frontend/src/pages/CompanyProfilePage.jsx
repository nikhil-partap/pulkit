import React, { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Building2, Mail, MapPin, RefreshCw, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

export default function CompanyProfilePage() {
  const { recruiterId } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getRecruiterCompanyProfile(recruiterId).then(setCompany).catch((requestError) => setError(requestError.message || 'Could not load this company.')).finally(() => setLoading(false));
  }, [recruiterId]);

  return <div className="dashboard-screen"><Navbar workspaceLabel="Company profile" /><main className="company-profile-page">
    <Link className="back-to-jobs" to="/student"><ArrowLeft size={16} /> Back to opportunities</Link>
    {loading ? <div className="profile-loading"><RefreshCw className="spin-icon" size={25} /><p>Loading company profile...</p></div> : error ? <div className="profile-loading"><h1>Company unavailable</h1><p>{error}</p></div> : <><section className="company-profile-hero"><div className="company-profile-logo"><Building2 size={34} /></div><div><p className="small-heading">VERIFIED EMPLOYER</p><h1>{company.company}</h1><p>{company.industry} · {company.activeRoles.length} live opportunity{company.activeRoles.length === 1 ? '' : 'ies'}</p></div></section>
      <section className="company-profile-grid"><article className="profile-card"><p className="small-heading">ABOUT THIS EMPLOYER</p><h2>Roles made for student schedules.</h2><p className="profile-bio">{company.company} is hiring students for flexible, practical work. Review the opportunity details and contact information before applying.</p><div className="company-contact"><UserRound size={18} /><div><strong>{company.contactName}</strong><span>{company.contactRole}</span></div><Mail size={17} /><a href={`mailto:${company.email}`}>{company.email}</a></div></article><aside className="profile-card"><p className="small-heading">OPEN OPPORTUNITIES</p><h2>Current roles</h2><div className="company-role-list">{company.activeRoles.length ? company.activeRoles.map((role) => <Link key={role.id} to={`/jobs/${role.id}`}><BriefcaseBusiness size={16} /><span><strong>{role.title}</strong><small>{role.type} · {role.hours}</small></span><span className="company-role-pay">₹{role.pay}/hr</span></Link>) : <p>No active roles right now.</p>}</div></aside></section>
    </>}
  </main></div>;
}
