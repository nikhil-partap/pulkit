import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, BriefcaseBusiness, CheckCircle2, Clock3, FileText, MapPin, RefreshCw, XCircle } from 'lucide-react';
import { api } from '../services/api';

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

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [appData, savedIds, allJobs] = await Promise.all([api.getStudentApplications(user.id), api.getSavedJobIds(user.id), api.getActiveJobs()]);
      setApplications(appData);
      setSavedJobs(allJobs.filter((job) => savedIds.map(Number).includes(Number(job.id))));
    } catch (requestError) { setError('Could not load your applications. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [user.id]);

  const counts = useMemo(() => ({
    applied: applications.filter((item) => item.status === 'Applied').length,
    accepted: applications.filter((item) => item.status === 'Accepted').length,
    rejected: applications.filter((item) => item.status === 'Rejected').length,
    saved: savedJobs.length,
  }), [applications, savedJobs]);

  const visibleItems = useMemo(() => {
    const source = activeTab === 'saved' ? savedJobs.map((job) => ({ ...job, job_title: job.title, company_name: job.company, work_type: job.type, status: 'Saved' })) : applications.filter((item) => item.status.toLowerCase() === activeTab);
    return [...source].sort((left, right) => {
      if (sortBy === 'company') return (left.company_name || left.company || '').localeCompare(right.company_name || right.company || '');
      if (sortBy === 'pay') return Number.parseInt(right.pay, 10) - Number.parseInt(left.pay, 10);
      return Number(right.application_id || right.id) - Number(left.application_id || left.id);
    });
  }, [activeTab, applications, savedJobs, sortBy]);

  return <main className="student-workspace-content applications-page">
    <section className="applications-hero">
      <div><p className="small-heading">YOUR CAREER JOURNEY</p><h1>My applications</h1><p>Track every job you applied to, saved for later, or heard back from.</p></div>
      <div className="application-hero-stat"><BriefcaseBusiness size={19} /><strong>{applications.length}</strong><span>applications sent</span></div>
    </section>
    <section className="applications-panel">
      <div className="applications-panel-heading"><div><p className="small-heading">APPLICATION TRACKER</p><h2>Keep your next step in view</h2></div><label className="application-sort">Sort by <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="newest">Newest</option><option value="company">Company</option><option value="pay">Highest pay</option></select></label></div>
      <div className="application-tabs" role="tablist" aria-label="Application status">
        {tabs.map(({ id, label, icon: Icon }) => <button type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'active' : ''} key={id} onClick={() => setActiveTab(id)}><Icon size={15} />{label}<span>{counts[id]}</span></button>)}
      </div>
      {error && <div className="applications-error"><span>{error}</span><button type="button" onClick={load}><RefreshCw size={14} /> Retry</button></div>}
      {loading ? <div className="applications-loading"><RefreshCw className="spin-icon" size={24} /><p>Loading your activity...</p></div> : visibleItems.length ? <div className="application-list">{visibleItems.map((item) => <article className="application-row" key={item.application_id || item.id}><div className={`application-status-dot ${item.status.toLowerCase()}`} /><div className="application-main"><p className="application-company">{item.company_name || item.company || 'Verified employer'}</p><h3>{item.job_title || item.title}</h3><div><span><MapPin size={13} />{item.location || 'Location shared after selection'}</span><span><Clock3 size={13} />{item.hours || item.work_type || item.type}</span></div></div><div className="application-pay"><strong>{item.pay ? `₹${item.pay}${activeTab === 'saved' ? '/hr' : '/hr'}` : 'Pay not listed'}</strong><div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>{item.job_status === 'Paused' && <span className="application-status-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Job Paused</span>}<span className={`application-status-badge ${item.status.toLowerCase()}`}>{item.status}</span></div></div></article>)}</div> : <div className="applications-empty"><span>{activeTab === 'saved' ? <Bookmark size={25} /> : <FileText size={25} />}</span><h3>No {activeTab} jobs yet</h3><p>{activeTab === 'saved' ? 'Save a job from Job opportunities and it will appear here.' : activeTab === 'accepted' ? 'Accepted applications will show up here when a recruiter selects you.' : activeTab === 'rejected' ? 'Any declined applications will be kept here for your records.' : 'Browse live roles and apply to start tracking your progress.'}</p><button type="button" className="session-save-button" onClick={() => onNavigate('jobs')}>Browse opportunities</button></div>}
    </section>
  </main>;
}
