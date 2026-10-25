import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import RecruiterSidebar from '../components/RecruiterSidebar';
import JobCardRecruiter from '../components/JobCardRecruiter';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { PlusCircle, Filter, ArrowRight, RefreshCw, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { changeJobStatus, createJob, deleteJob, loadRecruiterJobs } from '../store/jobsSlice';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { addNotification } = useNotifications();
  const routeLocation = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobs = useSelector((state) => state.jobs.recruiter);
  const [applications, setApplications] = useState([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postingLoading, setPostingLoading] = useState(false);
  const [jobMessage, setJobMessage] = useState('');
  const [isJobError, setIsJobError] = useState(false);
  const initialTab = searchParams.get('tab') || searchParams.get('page') || routeLocation.state?.activePage || 'listings';
  const [activePage, setActivePage] = useState(initialTab);

  useEffect(() => {
    const pageFromUrl = searchParams.get('tab') || searchParams.get('page') || routeLocation.state?.activePage;
    if (pageFromUrl && pageFromUrl !== activePage) {
      setActivePage(pageFromUrl);
    }
  }, [searchParams, routeLocation.state]);

  const handlePageChange = (page) => {
    setActivePage(page);
    setSearchParams(page === 'listings' ? {} : { tab: page });
  };

  // Form State
  const [title, setTitle] = useState('');
  const [workType, setWorkType] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [pay, setPay] = useState('');
  const [vacancies, setVacancies] = useState(1);
  const [description, setDescription] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [, appsRes] = await Promise.all([
        dispatch(loadRecruiterJobs(user.id)).unwrap(),
        api.getRecruiterApplications(user.id),
      ]);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
    } catch (err) {
      console.error('Error loading recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleAppUpdated = () => { loadData(); };
    window.addEventListener('kairos_application_updated', handleAppUpdated);
    window.addEventListener('kairos_jobs_updated', handleAppUpdated);
    window.addEventListener('storage', handleAppUpdated);
    return () => {
      window.removeEventListener('kairos_application_updated', handleAppUpdated);
      window.removeEventListener('kairos_jobs_updated', handleAppUpdated);
      window.removeEventListener('storage', handleAppUpdated);
    };
  }, [user?.id]);

  const handleAcceptApplicant = async (applicationId) => {
    try {
      const res = await api.updateApplicationStatus(applicationId, user.id, 'Accepted');
      setApplications((prev) =>
        prev.map((a) => {
          if (a.application_id === applicationId) {
            return { ...a, status: 'Accepted' };
          }
          if (res?.autoPaused && res?.autoRejectedApplicants?.some((rej) => rej.application_id === a.application_id)) {
            return { ...a, status: 'Rejected' };
          }
          return a;
        })
      );
      if (user?.id) {
        await dispatch(loadRecruiterJobs(user.id)).unwrap();
      }
      const applicant = applications.find((item) => item.application_id === applicationId);
      addNotification({
        title: 'Application accepted',
        body: `Your application for ${applicant?.job_title || 'the role'} was accepted.`,
        type: 'application',
        recipient: { role: 'Student', id: applicant?.student_id }
      });
      if (res?.autoPaused) {
        addNotification({
          title: 'All Vacancies Filled',
          body: `All positions filled for "${applicant?.job_title || 'Job Listing'}". The listing was paused and ${res.autoRejectedApplicants?.length || 0} remaining application(s) were automatically rejected.`,
          type: 'application'
        });
        if (res.autoRejectedApplicants?.length) {
          res.autoRejectedApplicants.forEach((rej) => {
            addNotification({
              title: 'Application update',
              body: `All vacancies for "${applicant?.job_title || 'the role'}" have been filled. Your application has been closed.`,
              type: 'application',
              recipient: { role: 'Student', id: rej.student_id }
            });
          });
        }
      }
    } catch (err) {
      console.error('Error accepting applicant:', err);
      alert(err.message || 'Could not accept applicant.');
      loadData();
    }
  };

  const handleRejectApplicant = async (applicationId) => {
    try {
      await api.updateApplicationStatus(applicationId, user.id, 'Rejected');
      setApplications((prev) =>
        prev.map((a) => (a.application_id === applicationId ? { ...a, status: 'Rejected' } : a))
      );
      const applicant = applications.find((item) => item.application_id === applicationId);
      addNotification({
        title: 'Application rejected',
        body: `Application for ${applicant?.student_name || 'applicant'} (${applicant?.job_title || 'the role'}) was rejected.`,
        type: 'application'
      });
      addNotification({
        title: 'Application update',
        body: `Your application for ${applicant?.job_title || 'the role'} was not accepted.`,
        type: 'application',
        recipient: { role: 'Student', id: applicant?.student_id }
      });
    } catch (err) {
      console.error('Error rejecting applicant:', err);
      loadData();
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setJobMessage('');
    setIsJobError(false);

    if (!title || !workType || !location || !hours || !pay || !description) {
      setIsJobError(true);
      setJobMessage('Please complete every job field.');
      return;
    }

    setPostingLoading(true);
    try {
      await dispatch(createJob({
        recruiterId: user.id,
        title: title.trim(),
        type: workType,
        location: location.trim(),
        hours,
        pay: pay.trim(),
        vacancies: Number(vacancies) || 1,
        description: description.trim(),
      })).unwrap();

      setJobMessage('Your job is live and ready for students to discover!');
      addNotification({ title: 'Job published', body: `${title.trim()} is now live for students to discover.`, type: 'application' });
      setIsJobError(false);

      setTitle(''); setWorkType(''); setLocation(''); setHours(''); setPay(''); setVacancies(1); setDescription('');
      await loadData();
      setActivePage('listings');
    } catch (err) {
      setIsJobError(true);
      setJobMessage(err.message || 'Could not publish your job.');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const targetJob = jobs.find((j) => Number(j.id) === Number(jobId));
    const vac = targetJob?.vacancies !== undefined ? Number(targetJob.vacancies) : 1;
    if (currentStatus === 'Paused' && vac <= 0) {
      alert('Cannot activate this listing because 0 vacancies are left. Vacancies must be greater than 0 to activate.');
      return;
    }
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await dispatch(changeJobStatus({ jobId, recruiterId: user.id, status: newStatus })).unwrap();
      await dispatch(loadRecruiterJobs(user.id)).unwrap();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Error updating status');
      loadData();
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await dispatch(deleteJob({ jobId, recruiterId: user.id })).unwrap();
      await dispatch(loadRecruiterJobs(user.id)).unwrap();
      setApplications((prev) => prev.filter((a) => a.job_id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      loadData();
    }
  };

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => !activeOnly || job.status === 'Active');
  }, [jobs, activeOnly]);

  const activeCount = useMemo(() => jobs.filter((job) => job.status === 'Active').length, [jobs]);
  const pendingApplicants = useMemo(() => applications.filter((a) => a.status !== 'Accepted' && a.status !== 'Rejected').length, [applications]);

  // ---------- Page Views ----------

  const ListingsAndPostView = (
    <main className="recruiter-workspace-main">
      {/* Intro Hero */}
      <section className="dashboard-intro">
        <div>
          <p className="small-heading">RECRUITER WORKSPACE</p>
          <h1>
            Find the students
            <br />
            your team needs.
          </h1>
          <p id="welcomeText">
            <strong>{user?.company || 'Your company'}</strong> can publish flexible opportunities for students ready to contribute.
          </p>
        </div>
        <div className="intro-stat">
          <strong id="jobCount">{activeCount}</strong>
          <span>active jobs</span>
        </div>
      </section>

      {/* Two-column Grid: Job Posting Form & Listings */}
      <section className="dashboard-grid">
        {/* Post Job Card */}
        <section id="post-job" className="job-form-card">
          <div className="section-heading">
            <div>
              <p className="small-heading">NEW OPPORTUNITY</p>
              <h2>Post a part-time job</h2>
            </div>
            <span className="step-tag">Fast Publish</span>
          </div>

          <form id="jobForm" onSubmit={handlePostJob} noValidate>
            <label htmlFor="jobTitle">Job title</label>
            <input
              id="jobTitle"
              placeholder="e.g. Café Team Member, Social Media Assistant"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="two-fields">
              <div>
                <label htmlFor="jobType">Work arrangement</label>
                <select id="jobType" value={workType} onChange={(e) => setWorkType(e.target.value)} required>
                  <option value="" disabled>Choose</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label htmlFor="jobLocation">Location</label>
                <input
                  id="jobLocation"
                  placeholder="e.g. Connaught Place, South Delhi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="three-fields">
              <div>
                <label htmlFor="jobHours">Hours per week</label>
                <select id="jobHours" value={hours} onChange={(e) => setHours(e.target.value)} required>
                  <option value="" disabled>Choose</option>
                  <option value="5–10 hours">5–10 hours</option>
                  <option value="10–15 hours">10–15 hours</option>
                  <option value="15–20 hours">15–20 hours</option>
                  <option value="20+ hours">20+ hours</option>
                </select>
              </div>
              <div>
                <label htmlFor="jobPay">Pay rate</label>
                <input
                  id="jobPay"
                  placeholder="e.g. ₹200 / hour"
                  value={pay}
                  onChange={(e) => setPay(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="jobVacancies">Vacancies</label>
                <input
                  id="jobVacancies"
                  type="number"
                  min="1"
                  max="99"
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  required
                />
              </div>
            </div>

            <label htmlFor="jobDescription">About the role</label>
            <textarea
              id="jobDescription"
              maxLength={350}
              placeholder="Describe what the student will do, skills valued, and schedule flexibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button className="sign-in-button" type="submit" disabled={postingLoading}>
              {postingLoading ? 'Publishing...' : 'Publish job'}{' '}
              <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>

            {jobMessage && (
              <p className={`message ${isJobError ? 'error-message' : ''}`} aria-live="polite">
                {jobMessage}
              </p>
            )}
          </form>
        </section>

        {/* Listings & Applicants Panel */}
        <section id="jobs" className="jobs-panel">
          <div className="section-heading">
            <div>
              <p className="small-heading">YOUR LISTINGS</p>
              <h2>Posted jobs</h2>
            </div>
            <button
              id="showActiveJobs"
              className={`text-action${activeOnly ? ' selected' : ''}`}
              type="button"
              onClick={() => setActiveOnly(!activeOnly)}
            >
              <Filter size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {activeOnly ? 'Show all jobs' : 'Active only'}
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <RefreshCw size={22} className="spin-icon" style={{ marginBottom: '10px' }} />
              <p>Loading your posted jobs and applicants...</p>
            </div>
          ) : visibleJobs.length === 0 ? (
            <div className="empty-jobs">
              <span>
                <PlusCircle size={24} />
              </span>
              <h3>Your first listing starts here</h3>
              <p>Fill in the form on the left to publish a flexible role for students.</p>
            </div>
          ) : (
            <div id="jobsList" className="jobs-list">
              {visibleJobs.map((job) => (
                <JobCardRecruiter
                  key={job.id}
                  job={job}
                  applications={applications}
                  onToggleStatus={handleToggleStatus}
                  onDeleteJob={handleDeleteJob}
                  onAcceptApplicant={handleAcceptApplicant}
                  onRejectApplicant={handleRejectApplicant}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );

  const ApplicantsView = (
    <main className="recruiter-workspace-main">
      <section className="recruiter-page-hero">
        <div>
          <p className="small-heading">CANDIDATE PIPELINE</p>
          <h1>Applicants</h1>
          <p>Review students who applied to your roles and accept the best fits.</p>
        </div>
        <div className="recruiter-hero-stat">
          <strong>{pendingApplicants}</strong>
          <span>pending review</span>
        </div>
      </section>

      <section className="jobs-panel recruiter-standalone-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <RefreshCw size={22} className="spin-icon" style={{ marginBottom: '10px' }} />
            <p>Loading applicants...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-jobs">
            <span><Users size={24} /></span>
            <h3>No applicants yet</h3>
            <p>Once students apply to your jobs, they will appear here.</p>
          </div>
        ) : (
          <div className="recruiter-applicants-list">
            {applications.map((app) => (
              <div key={app.application_id} className="recruiter-applicant-row">
                <div className="recruiter-applicant-avatar">
                  {(app.student_name || 'S')[0].toUpperCase()}
                </div>
                <div className="recruiter-applicant-info">
                  <strong>{app.student_name || 'Unknown student'}</strong>
                  <span>{app.job_title}</span>
                  <small>{app.student_college || app.student_email || ''}</small>
                </div>
                <div className="recruiter-applicant-actions">
                  <Link to={`/students/${app.student_id}`} state={{ from: '/recruiter?tab=applicants', fromName: 'Applicants', activePage: 'applicants' }} className="view-applicant-portfolio">View portfolio</Link>
                  <span className={`application-status-badge ${(app.status || 'applied').toLowerCase()}`}>
                    {app.status || 'Applied'}
                  </span>
                  {app.status !== 'Accepted' && app.status !== 'Rejected' && (
                    <>
                      {(() => {
                        const targetJob = jobs.find((j) => Number(j.id) === Number(app.job_id));
                        const isNoVacancies = targetJob && Number(targetJob.vacancies) <= 0;
                        return (
                          <button
                            type="button"
                            className="recruiter-accept-btn"
                            onClick={() => handleAcceptApplicant(app.application_id)}
                            disabled={isNoVacancies}
                            style={isNoVacancies ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            title={isNoVacancies ? 'All vacancies filled' : 'Accept applicant'}
                          >
                            <CheckCircle2 size={13} /> Accept
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        className="recruiter-reject-btn"
                        onClick={() => handleRejectApplicant(app.application_id)}
                        title="Reject applicant"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );

  const pageMap = {
    listings: ListingsAndPostView,
    'post-job': ListingsAndPostView,
    jobs: ListingsAndPostView,
    applicants: ApplicantsView,
  };

  return (
    <div className="dashboard-screen recruiter-screen">
      <Navbar workspaceLabel="Recruiter workspace" />

      <div className="recruiter-workspace-layout">
        <RecruiterSidebar activePage={activePage} onChange={handlePageChange} pendingCount={pendingApplicants} />
        {pageMap[activePage] || ListingsAndPostView}
      </div>
    </div>
  );
}
