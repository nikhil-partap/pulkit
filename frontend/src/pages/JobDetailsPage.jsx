import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, Building2, Check, Clock3, IndianRupee, MapPin, PauseCircle, RefreshCw, Star, UsersRound, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const fromPath = location.state?.from;
    if (fromPath && typeof fromPath === 'string' && fromPath.startsWith('/') && !fromPath.startsWith('/companies')) {
      navigate(fromPath, { state: { activePage: location.state.activePage } });
      return;
    }
    navigate('/student');
  };

  const backLabel = (location.state?.fromName && !location.state?.from?.startsWith('/companies'))
    ? `Back to ${location.state.fromName}`
    : 'Back to job opportunities';

  const load = async () => {
    setLoading(true);
    try {
      const [jobData, applications, savedIds] = await Promise.all([
        api.getJobById(jobId),
        api.getStudentApplications(user.id),
        api.getSavedJobIds(user.id),
      ]);
      setJob(jobData || null);
      setApplication(applications.find((item) => Number(item.job_id) === Number(jobId)) || null);
      setSaved(savedIds.map(Number).includes(Number(jobId)));
    } catch (err) {
      console.error('Error loading job details:', err);
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
  }, [jobId, user?.id]);

  const vacanciesCount = job?.vacancies !== undefined ? Number(job.vacancies) : 1;
  const isPaused = job?.status === 'Paused' || vacanciesCount === 0;
  const isAccepted = application?.status === 'Accepted';
  const isRejected = application?.status === 'Rejected';

  const handleApply = async () => {
    if (isPaused) {
      setMessage('This job listing is currently paused and not accepting new applications.');
      return;
    }
    try {
      await api.applyForJob(job.id, user.id);
      await load();
      setMessage('Application submitted successfully.');
      addNotification({
        title: 'New application received',
        body: `${user.name || 'A student'} applied for ${job.title}.`,
        type: 'application',
        recipient: { role: 'Recruiter', id: job.recruiter_id },
      });
    } catch (error) {
      setMessage(error.message || 'Could not submit application.');
    }
  };

  const handleWithdrawClick = () => {
    if (!application || isAccepted) return;
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!application) return;
    setIsWithdrawing(true);
    try {
      await api.withdrawApplication(job.id, user.id);
      setApplication(null);
      setMessage(
        isAccepted
          ? 'Accepted application withdrawn. Vacancy reopened and the job is active again.'
          : 'Application withdrawn.'
      );
      addNotification({
        title: 'Application withdrawn',
        body: isAccepted
          ? `You withdrew your accepted position for ${job.title}.`
          : `You withdrew your application for ${job.title}.`,
        type: 'application',
      });
      if (isAccepted) {
        addNotification({
          title: 'Accepted student withdrawn',
          body: `${user.name || 'An accepted student'} has withdrawn from "${job.title}". The vacancy has reopened and the listing is active.`,
          type: 'application',
          recipient: { role: 'Recruiter', id: job.recruiter_id },
        });
      }
      setShowWithdrawModal(false);
      await load();
    } catch (error) {
      setMessage(error.message || 'Could not withdraw the application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const toggleSave = async () => {
    try {
      if (saved) {
        await api.removeSavedJob(user.id, job.id);
        setSaved(false);
        setMessage('Job removed from saved jobs.');
      } else {
        await api.saveJob(user.id, job.id);
        setSaved(true);
        setMessage('Job saved for later.');
      }
    } catch (error) {
      setMessage(error.message || 'Could not update saved jobs.');
    }
  };

  return (
    <div className="dashboard-screen">
      <Navbar workspaceLabel="Job details" />
      <main className="job-detail-page">
        {loading ? (
          <div className="job-detail-loading">
            <RefreshCw className="spin-icon" size={25} />
            <p>Loading job details...</p>
          </div>
        ) : !job || (isPaused && !isAccepted && !isRejected) ? (
          <div className="job-not-found">
            <BriefcaseBusiness size={32} />
            <h1>Opportunity not available</h1>
            <p>This role is currently paused and no longer accepting applications.</p>
            <button type="button" className="session-save-button" onClick={handleBack}>
              {backLabel}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="back-to-jobs"
              onClick={handleBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
              <ArrowLeft size={16} /> {backLabel}
            </button>

            <section className="job-detail-hero">
              <div>
                <span className={isPaused ? 'status paused' : 'status active'}>
                  {isPaused ? (
                    <>
                      <PauseCircle size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                      Listing Paused
                    </>
                  ) : (
                    'Live opportunity'
                  )}
                </span>
                <h1>{job.title}</h1>
                <p className="job-detail-company">
                  <Building2 size={16} /> {job.company}
                </p>
                <div className="job-detail-facts">
                  <span><MapPin size={15} /> {job.location}</span>
                  <span><Clock3 size={15} /> {job.hours}</span>
                  <span><BriefcaseBusiness size={15} /> {job.type}</span>
                  <span><IndianRupee size={15} /> {job.pay}/hour</span>
                </div>
              </div>

              <div className="job-detail-actions">
                {isAccepted ? (
                  <button type="button" className="detail-apply accepted" disabled>
                    <Check size={17} /> Application accepted
                  </button>
                ) : isRejected ? (
                  <button type="button" className="detail-apply rejected" disabled>
                    <XCircle size={17} /> Application rejected
                  </button>
                ) : application ? (
                  <button type="button" className="detail-apply" onClick={handleWithdrawClick}>
                    Withdraw application
                  </button>
                ) : isPaused ? (
                  <button
                    type="button"
                    className="detail-apply paused-btn"
                    disabled
                  >
                    <PauseCircle size={16} style={{ marginRight: '4px' }} />
                    Applications paused
                  </button>
                ) : (
                  <button type="button" className="detail-apply" onClick={handleApply}>
                    Apply now
                  </button>
                )}

                <button
                  type="button"
                  className={saved ? 'detail-save saved' : 'detail-save'}
                  onClick={toggleSave}
                >
                  <Star size={17} /> {saved ? 'Saved' : 'Save job'}
                </button>

                {isRejected && (
                  <p className="job-action-message" style={{ color: '#fca5a5' }}>
                    Your application was declined by the recruiter.
                  </p>
                )}
                {isPaused && !application && (
                  <p className="job-action-message" style={{ color: '#f59e0b' }}>
                    {vacanciesCount === 0
                      ? 'All open positions have been filled. Applications are closed.'
                      : 'This listing is paused and not accepting new applications.'}
                  </p>
                )}
                {isPaused && application && !isAccepted && !isRejected && (
                  <p className="job-action-message" style={{ color: '#cbd5e1' }}>
                    This listing is paused, but your submitted application remains on file.
                  </p>
                )}
                {message && <p className="job-action-message">{message}</p>}
              </div>
            </section>

            <section className="job-detail-grid">
              <article className="job-detail-card">
                <p className="small-heading">ABOUT THE ROLE</p>
                <h2>What you will do</h2>
                <p className="job-detail-description">{job.description}</p>
                <div className="detail-opening">
                  <UsersRound size={18} />
                  <div>
                    <strong>
                      {vacanciesCount} open position{vacanciesCount === 1 ? '' : 's'}
                    </strong>
                    <span>
                      {isPaused
                        ? (vacanciesCount === 0 ? 'All positions filled.' : 'Listing is currently paused.')
                        : 'Apply early while the role is active.'}
                    </span>
                  </div>
                </div>
              </article>

              <aside className="recruiter-detail-card">
                <p className="small-heading">COMPANY PROFILE</p>
                <div className="recruiter-detail-icon">
                  <Building2 size={21} />
                </div>
                <h2>{job.company || 'Company: Not provided'}</h2>
                <p>{job.industry || 'Industry: Not provided'}</p>
                <dl>
                  <div>
                    <dt>Posted by</dt>
                    <dd>{job.recruiter_name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{job.recruiter_role || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      {job.recruiter_email ? (
                        <a href={`mailto:${job.recruiter_email}`}>{job.recruiter_email}</a>
                      ) : (
                        'Not provided'
                      )}
                    </dd>
                  </div>
                </dl>
                <Link
                  className="company-profile-link"
                  to={`/companies/${job.recruiter_id}`}
                  state={{ from: `/jobs/${job.id}`, fromName: 'Job details' }}
                >
                  View company profile
                </Link>
              </aside>
            </section>
          </>
        )}
      </main>

      <ConfirmationModal
        isOpen={showWithdrawModal}
        title="Withdraw Application"
        message="Are you sure you want to withdraw your application?"
        subMessage="Your application will be removed from recruiter review."
        confirmText="Yes, withdraw"
        cancelText="Cancel"
        isLoading={isWithdrawing}
        onConfirm={confirmWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />
    </div>
  );
}
