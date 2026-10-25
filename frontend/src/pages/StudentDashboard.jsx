import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobCardStudent from '../components/JobCardStudent';
import StudentSidebar from '../components/StudentSidebar';
import SkillExchangePage from './SkillExchangePage';
import CreateSessionPage from './CreateSessionPage';
import MySessionsPage from './MySessionsPage';
import BookedSessionsPage from './BookedSessionsPage';
import MyApplicationsPage from './MyApplicationsPage';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { loadActiveJobs } from '../store/jobsSlice';
import { Search, Sparkles, Bookmark, RefreshCw, FileText, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobs = useSelector((state) => state.jobs.active);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [studentApplications, setStudentApplications] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'accepted' | 'applied' | 'saved'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initialTab = searchParams.get('tab') || searchParams.get('page') || location.state?.activePage || 'jobs';
  const [activePage, setActivePage] = useState(initialTab);

  useEffect(() => {
    const pageFromUrl = searchParams.get('tab') || searchParams.get('page') || location.state?.activePage;
    if (pageFromUrl && pageFromUrl !== activePage) {
      setActivePage(pageFromUrl);
    }
  }, [searchParams, location.state]);

  const handlePageChange = (page) => {
    if (page === 'settings') {
      navigate('/settings');
      return;
    }
    setActivePage(page);
    setSearchParams(page === 'jobs' ? {} : { tab: page });
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [, savedRes, appsRes] = await Promise.all([
        dispatch(loadActiveJobs(user.id)).unwrap(),
        api.getSavedJobIds(user.id),
        api.getStudentApplications(user.id),
      ]);
      setSavedJobIds(Array.isArray(savedRes) ? savedRes : []);
      setStudentApplications(Array.isArray(appsRes) ? appsRes : []);
    } catch (err) {
      console.error('Error loading student jobs:', err);
      setError('Could not load jobs from storage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for live cross-tab & custom application events
    const handleSync = () => {
      loadData();
    };
    window.addEventListener('kairos_application_updated', handleSync);
    window.addEventListener('kairos_jobs_updated', handleSync);
    window.addEventListener('kairos_message_sent', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('kairos_application_updated', handleSync);
      window.removeEventListener('kairos_jobs_updated', handleSync);
      window.removeEventListener('kairos_message_sent', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user?.id]);

  const appliedJobIds = useMemo(() => {
    return studentApplications.map((a) => Number(a.job_id));
  }, [studentApplications]);

  const acceptedJobIds = useMemo(() => {
    return studentApplications
      .filter((a) => a.status === 'Accepted')
      .map((a) => Number(a.job_id));
  }, [studentApplications]);

  const rejectedJobIds = useMemo(() => {
    return studentApplications
      .filter((a) => a.status === 'Rejected')
      .map((a) => Number(a.job_id));
  }, [studentApplications]);

  const handleToggleApply = async (jobId) => {
    const isApplied = appliedJobIds.includes(jobId);
    try {
      if (isApplied) {
        const currentApp = studentApplications.find((a) => Number(a.job_id) === Number(jobId));
        if (currentApp?.status === 'Accepted') {
          return;
        }
        setStudentApplications((prev) => prev.filter((a) => Number(a.job_id) !== Number(jobId)));
        await api.withdrawApplication(jobId, user.id);
        await loadData();
      } else {
        await api.applyForJob(jobId, user.id);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
      loadData();
    }
  };

  const handleToggleSave = async (jobId) => {
    const isSaved = savedJobIds.includes(jobId);
    try {
      if (isSaved) {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        await api.removeSavedJob(user.id, jobId);
      } else {
        setSavedJobIds((prev) => [...prev, jobId]);
        await api.saveJob(user.id, jobId);
      }
    } catch (err) {
      console.error('Failed to update saved job status:', err);
      loadData();
    }
  };



  const liveJobs = useMemo(() => {
    return jobs.filter((job) => {
      const vac = job.vacancies !== undefined ? Number(job.vacancies) : 1;
      const isPaused = job.status === 'Paused' || vac <= 0;
      const isAccepted = acceptedJobIds.includes(job.id);
      const isRejected = rejectedJobIds.includes(job.id);
      // Don't show paused opportunities to ones who have not applied yet,
      // but do show them to ones who got rejected or selected
      if (isPaused) {
        return isAccepted || isRejected;
      }
      return true;
    });
  }, [jobs, acceptedJobIds, rejectedJobIds]);

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return liveJobs.filter((job) => {
      const matchesSearch =
        !term ||
        `${job.title} ${job.location} ${job.type} ${job.company} ${job.recruiter_name || ''}`
          .toLowerCase()
          .includes(term);

      let matchesFilter = true;
      if (filterTab === 'accepted') {
        matchesFilter = acceptedJobIds.includes(job.id);
      } else if (filterTab === 'rejected') {
        matchesFilter = rejectedJobIds.includes(job.id);
      } else if (filterTab === 'applied') {
        matchesFilter = appliedJobIds.includes(job.id);
      } else if (filterTab === 'saved') {
        matchesFilter = savedJobIds.includes(job.id);
      }

      return matchesSearch && matchesFilter;
    });
  }, [liveJobs, searchTerm, filterTab, savedJobIds, appliedJobIds, acceptedJobIds, rejectedJobIds]);

  return (
    <div className="dashboard-screen student-screen">
      <Navbar
        workspaceLabel="Student workspace"
        activePage={activePage}
        onNavChange={handlePageChange}
      />

      <div className="student-workspace-layout">
        <StudentSidebar activePage={activePage} onChange={handlePageChange} />
        {activePage === 'skills' ? <SkillExchangePage firstName={firstName} user={user} /> : activePage === 'booked-sessions' ? <BookedSessionsPage user={user} onNavigate={handlePageChange} /> : activePage === 'create-session' ? <CreateSessionPage user={user} onNavigate={handlePageChange} /> : activePage === 'my-sessions' ? <MySessionsPage user={user} onNavigate={handlePageChange} /> : activePage === 'applications' ? <MyApplicationsPage user={user} onNavigate={handlePageChange} /> : <main className="dashboard-main student-dashboard-main">
        {/* Hero Section */}
        <section className="student-hero">
          <div>
            <p className="small-heading">OPPORTUNITIES FOR STUDENTS</p>
            <h1>
              Find work that
              <br />
              works for you.
            </h1>
            <p id="studentWelcome">
              Hi <strong>{firstName}</strong>, browse flexible, verified part-time roles from local employers.
            </p>
          </div>

          <div className="live-indicator">
            <span />
            <strong>{jobs.filter((j) => j.status === 'Active' && (j.vacancies === undefined || Number(j.vacancies) > 0)).length}</strong> live jobs
          </div>
        </section>

        {error && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fdf2f2', color: '#b43c36', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button type="button" onClick={loadData} style={{ background: 'none', border: 'none', color: '#b43c36', cursor: 'pointer', fontWeight: 'bold' }}>
              <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retry
            </button>
          </div>
        )}

        {/* Jobs Section */}
        <section id="live-jobs" className="student-jobs-section">
          <div className="student-section-bar">
            <div>
              <p className="small-heading">LIVE OPPORTUNITIES</p>
              <h2>
                {filterTab === 'accepted'
                  ? ' Accepted Applications'
                  : filterTab === 'rejected'
                  ? ' Declined Applications'
                  : filterTab === 'applied'
                  ? 'Your Applied Roles'
                  : filterTab === 'saved'
                  ? 'Your Saved Jobs'
                  : 'Jobs available now'}
              </h2>
            </div>

            <div className="job-tools">
              <div className="tab-pills-group">
                <button
                  type="button"
                  className={`text-action ${filterTab === 'all' ? 'selected' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  All ({liveJobs.length})
                </button>

                {acceptedJobIds.length > 0 && (
                  <button
                    type="button"
                    className={`text-action accepted-tab ${filterTab === 'accepted' ? 'selected' : ''}`}
                    onClick={() => setFilterTab('accepted')}
                  >
                    <Sparkles size={12} style={{ marginRight: '3px' }} /> Accepted ({acceptedJobIds.length})
                  </button>
                )}

                {rejectedJobIds.length > 0 && (
                  <button
                    type="button"
                    className={`text-action rejected-tab ${filterTab === 'rejected' ? 'selected' : ''}`}
                    onClick={() => setFilterTab('rejected')}
                  >
                    <XCircle size={12} style={{ marginRight: '3px' }} /> Rejected ({rejectedJobIds.length})
                  </button>
                )}

                <button
                  type="button"
                  className={`text-action ${filterTab === 'applied' ? 'selected' : ''}`}
                  onClick={() => setFilterTab('applied')}
                >
                  <FileText size={12} style={{ marginRight: '3px' }} /> Applied ({appliedJobIds.length})
                </button>

                <button
                  id="savedJobsButton"
                  className={`text-action ${filterTab === 'saved' ? 'selected' : ''}`}
                  onClick={() => setFilterTab('saved')}
                >
                  <Bookmark size={12} style={{ marginRight: '3px' }} /> Saved ({savedJobIds.length})
                </button>
              </div>

              <label className="search-box" htmlFor="jobSearch">
                <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <input
                  id="jobSearch"
                  type="search"
                  placeholder="Search jobs, companies, or locations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '10px' }} />
              <p>Loading available opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="student-empty">
              <span>
                <Search size={22} />
              </span>
              <h3>
                {searchTerm
                  ? 'No roles match that search'
                  : filterTab === 'accepted'
                  ? 'No accepted applications yet'
                  : filterTab === 'rejected'
                  ? 'No rejected applications'
                  : filterTab === 'applied'
                  ? 'You have not applied to any roles yet'
                  : filterTab === 'saved'
                  ? 'No saved jobs yet'
                  : 'New opportunities are on their way'}
              </h3>
              <p>
                {searchTerm
                  ? 'Try another job title or location.'
                  : filterTab === 'accepted'
                  ? 'When recruiters accept your application, you will be notified here and can chat directly.'
                  : filterTab === 'rejected'
                  ? 'If a recruiter does not move forward with an application, it will appear here.'
                  : filterTab === 'applied'
                  ? 'Browse live jobs and click "Apply Now" to start sending applications.'
                  : filterTab === 'saved'
                  ? 'Click "Save " on any job to keep track of roles you like.'
                  : 'Check back soon — recruiters can publish jobs here anytime.'}
              </p>
            </div>
          ) : (
            <div id="studentJobsList" className="student-jobs-grid">
              {filteredJobs.map((job) => {
                const app = studentApplications.find((a) => Number(a.job_id) === Number(job.id));
                return (
                  <JobCardStudent
                    key={job.id}
                    job={job}
                    application={app}
                    isApplied={appliedJobIds.includes(job.id)}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleApply={handleToggleApply}
                    onToggleSave={handleToggleSave}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Steps / Guidance */}
        <section id="how-it-works" className="student-steps">
          <div>
            <b>1</b>
            <h3>Explore live roles</h3>
            <p>See jobs posted by recruiters as soon as they are active.</p>
          </div>
          <div>
            <b>2</b>
            <h3>Check the fit & Apply</h3>
            <p>Review the hours, location, pay, and number of openings.</p>
          </div>
          <div>
            <b>3</b>
            <h3>Get notified on acceptance</h3>
            <p>Employers accept your application and contact you directly.</p>
          </div>
        </section>
        </main>}
      </div>
    </div>
  );
}
