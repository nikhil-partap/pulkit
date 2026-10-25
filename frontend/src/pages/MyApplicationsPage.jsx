import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, CheckCircle2, Clock3, FileText, MapPin, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const tabs = [
  { id: 'applied', label: 'Applied', icon: FileText },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'accepted', label: 'Accepted', icon: CheckCircle2 },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
];

export default function MyApplicationsPage({ user, onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('applied');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [appData, savedIds, allJobs] = await Promise.all([
        api.getStudentApplications(user.id),
        api.getSavedJobIds(user.id),
        api.getActiveJobs(user.id),
      ]);
      setApplications(appData);
      setSavedJobs(allJobs.filter((job) => savedIds.map(Number).includes(Number(job.id))));
    } catch (requestError) {
      setError('Could not load your applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleSync = () => { load(); };
    window.addEventListener('kairos_application_updated', handleSync);
    window.addEventListener('kairos_jobs_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('kairos_application_updated', handleSync);
      window.removeEventListener('kairos_jobs_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user.id]);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    setIsWithdrawing(true);
    try {
      await api.withdrawApplication(withdrawTarget.jobId, user.id);
      setWithdrawTarget(null);
      await load();
    } catch (err) {
      alert(err.message || 'Could not withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const counts = useMemo(() => {
    const liveApplications = applications.filter(
      (item) => !((item.job_status === 'Paused' || item.vacancies <= 0) && item.status !== 'Accepted' && item.status !== 'Rejected')
    );
    const liveSavedJobs = savedJobs.filter(
      (job) => job.status !== 'Paused' && (job.vacancies === undefined || Number(job.vacancies) > 0)
    );
    return {
      applied: liveApplications.filter((item) => item.status === 'Applied').length,
      accepted: liveApplications.filter((item) => item.status === 'Accepted').length,
      rejected: liveApplications.filter((item) => item.status === 'Rejected').length,
      saved: liveSavedJobs.length,
    };
  }, [applications, savedJobs]);

  const visibleItems = useMemo(() => {
    const liveApplications = applications.filter(
      (item) => !((item.job_status === 'Paused' || item.vacancies <= 0) && item.status !== 'Accepted' && item.status !== 'Rejected')
    );
    const liveSavedJobs = savedJobs.filter(
      (job) => job.status !== 'Paused' && (job.vacancies === undefined || Number(job.vacancies) > 0)
    );
    const source = activeTab === 'saved'
      ? liveSavedJobs.map((job) => ({ ...job, job_title: job.title, company_name: job.company, work_type: job.type, status: 'Saved' }))
      : liveApplications.filter((item) => item.status.toLowerCase() === activeTab);
    return [...source].sort((left, right) => {
      if (sortBy === 'company') return (left.company_name || left.company || '').localeCompare(right.company_name || right.company || '');
      if (sortBy === 'pay') return Number.parseInt(right.pay, 10) - Number.parseInt(left.pay, 10);
      return Number(right.application_id || right.id) - Number(left.application_id || left.id);
    });
  }, [activeTab, applications, savedJobs, sortBy]);

  return (
    <main className="student-workspace-content applications-page">
      <section className="applications-hero">
        <div>
          <p className="small-heading">YOUR CAREER JOURNEY</p>
          <h1>My applications</h1>
          <p>Track every job you applied to, saved for later, or heard back from.</p>
        </div>
        <div className="application-hero-stat">
          <BriefcaseBusiness size={19} />
          <strong>{applications.length}</strong>
          <span>applications sent</span>
        </div>
      </section>

      <section className="applications-panel">
        <div className="applications-panel-heading">
          <div>
            <p className="small-heading">APPLICATION TRACKER</p>
            <h2>Keep your next step in view</h2>
          </div>
          <label className="application-sort">
            Sort by{' '}
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="company">Company</option>
              <option value="pay">Highest pay</option>
            </select>
          </label>
        </div>

        <div className="application-tabs" role="tablist" aria-label="Application status">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={activeTab === id ? 'active' : ''}
              key={id}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              {label}
              <span>{counts[id]}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="applications-error">
            <span>{error}</span>
            <button type="button" onClick={load}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="applications-loading">
            <RefreshCw className="spin-icon" size={24} />
            <p>Loading your activity...</p>
          </div>
        ) : visibleItems.length ? (
          <div className="application-list">
            {visibleItems.map((item) => (
              <article className="application-row" key={item.application_id || item.id}>
                <div className={`application-status-dot ${item.status.toLowerCase()}`} />
                <div className="application-main">
                  <p className="application-company">{item.company_name || item.company || 'Verified employer'}</p>
                  <Link
                    to={`/jobs/${item.job_id || item.id}`}
                    state={{ from: '/student?tab=applications', fromName: 'My applications', activePage: 'applications' }}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ cursor: 'pointer' }}>{item.job_title || item.title}</h3>
                  </Link>
                  <div>
                    <span><MapPin size={13} />{item.location || 'Location shared after selection'}</span>
                    <span><Clock3 size={13} />{item.hours || item.work_type || item.type}</span>
                  </div>
                </div>
                <div className="application-pay">
                  <strong>{item.pay ? `₹${item.pay}${activeTab === 'saved' ? '/hr' : '/hr'}` : 'Pay not listed'}</strong>
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`application-status-badge ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    {item.status === 'Applied' && (
                      <button
                        type="button"
                        onClick={() =>
                          setWithdrawTarget({
                            jobId: item.job_id,
                            isAccepted: false,
                            jobTitle: item.job_title || item.title || 'Role',
                          })
                        }
                        style={{
                          background: 'none',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#ef4444',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="applications-empty">
            <span>{activeTab === 'saved' ? <Bookmark size={25} /> : <FileText size={25} />}</span>
            <h3>No {activeTab} jobs yet</h3>
            <p>
              {activeTab === 'saved'
                ? 'Save a job from Job opportunities and it will appear here.'
                : activeTab === 'accepted'
                ? 'Accepted applications will show up here when a recruiter selects you.'
                : activeTab === 'rejected'
                ? 'Any declined applications will be kept here for your records.'
                : 'Browse live roles and apply to start tracking your progress.'}
            </p>
            <button type="button" className="session-save-button" onClick={() => onNavigate('jobs')}>
              Browse opportunities
            </button>
          </div>
        )}
      </section>

      <ConfirmationModal
        isOpen={Boolean(withdrawTarget)}
        title="Withdraw Application"
        message="Are you sure you want to withdraw your application?"
        subMessage={`Your application for "${withdrawTarget?.jobTitle || 'this role'}" will be removed from recruiter review.`}
        confirmText="Yes, withdraw"
        cancelText="Cancel"
        isLoading={isWithdrawing}
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />
    </main>
  );
}
