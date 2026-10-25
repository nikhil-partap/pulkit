import React, { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Building2, Mail, RefreshCw, UserRound } from 'lucide-react';
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
    api.getRecruiterCompanyProfile(recruiterId)
      .then(setCompany)
      .catch((requestError) => setError(requestError.message || 'Could not load this company.'))
      .finally(() => setLoading(false));
  }, [recruiterId]);

  const backLabel = location.state?.fromName ? `Back to ${location.state.fromName}` : 'Back to opportunities';

  const companyName = company?.company?.trim() || 'Company: Not provided';
  const industry = company?.industry?.trim() || 'Industry: Not provided';
  const contactName = company?.contactName?.trim() || 'Not provided';
  const contactRole = company?.contactRole?.trim() || 'Not provided';
  const email = company?.email?.trim();
  const activeRoles = company?.activeRoles || [];

  return (
    <div className="dashboard-screen">
      <Navbar workspaceLabel="Company profile" />
      <main className="company-profile-page">
        <button
          type="button"
          className="back-to-jobs"
          onClick={handleBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
        >
          <ArrowLeft size={16} /> {backLabel}
        </button>

        {loading ? (
          <div className="profile-loading">
            <RefreshCw className="spin-icon" size={25} />
            <p>Loading company profile...</p>
          </div>
        ) : error ? (
          <div className="profile-loading">
            <h1>Company unavailable</h1>
            <p>{error}</p>
            <button type="button" className="session-save-button" onClick={handleBack}>
              {backLabel}
            </button>
          </div>
        ) : (
          <>
            <section className="company-profile-hero">
              <div className="company-profile-logo">
                <Building2 size={34} />
              </div>
              <div>
                <p className="small-heading">VERIFIED EMPLOYER</p>
                <h1>{companyName}</h1>
                <p>
                  {industry} · {activeRoles.length} live {activeRoles.length === 1 ? 'opportunity' : 'opportunities'}
                </p>
              </div>
            </section>

            <section className="company-profile-grid">
              <article className="profile-card">
                <p className="small-heading">ABOUT THIS EMPLOYER</p>
                <h2>Roles made for student schedules.</h2>
                <p className="profile-bio">
                  {company?.company?.trim() ? company.company : 'This employer'} is hiring students for flexible, practical work. Review the opportunity details and contact information before applying.
                </p>

                <div className="company-contact">
                  <UserRound size={18} />
                  <div>
                    <strong>{contactName}</strong>
                    <span>{contactRole}</span>
                  </div>
                  <Mail size={17} />
                  {email ? (
                    <a href={`mailto:${email}`}>{email}</a>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not provided</span>
                  )}
                </div>
              </article>

              <aside className="profile-card">
                <p className="small-heading">OPEN OPPORTUNITIES</p>
                <h2>Current roles</h2>
                <div className="company-role-list">
                  {activeRoles.length ? (
                    activeRoles.map((role) => (
                      <Link
                        key={role.id}
                        to={`/jobs/${role.id}`}
                        state={{ from: '/student', fromName: 'Job opportunities' }}
                      >
                        <BriefcaseBusiness size={16} />
                        <span>
                          <strong>{role.title || 'Role: Not provided'}</strong>
                          <small>
                            {role.type || 'Not provided'} · {role.hours ? role.hours : 'Hours: Not provided'}
                          </small>
                        </span>
                        <span className="company-role-pay">
                          {role.pay ? `₹${role.pay}/hr` : 'Pay: Not provided'}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="portfolio-newbie-state" style={{ marginTop: '12px' }}>
                      <BriefcaseBusiness size={20} />
                      <h3>Open opportunities</h3>
                      <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>Not provided</p>
                    </div>
                  )}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
