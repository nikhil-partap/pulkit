import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, Building2, Check, Clock3, IndianRupee, MapPin, RefreshCw, Star, UsersRound, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [jobs, applications, savedIds] = await Promise.all([api.getActiveJobs(user.id), api.getStudentApplications(user.id), api.getSavedJobIds(user.id)]);
      const found = jobs.find((item) => Number(item.id) === Number(jobId));
      setJob(found || null);
      setApplication(applications.find((item) => Number(item.job_id) === Number(jobId)) || null);
      setSaved(savedIds.map(Number).includes(Number(jobId)));
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [jobId, user.id]);

  const isAccepted = application?.status === 'Accepted';
  const isRejected = application?.status === 'Rejected';

  const toggleApplication = async () => {
    if (isAccepted || isRejected) return;
    try {
      if (application) { await api.withdrawApplication(job.id, user.id); setApplication(null); setMessage('Application withdrawn.'); addNotification({ title: 'Application withdrawn', body: `You withdrew your application for ${job.title}.`, type: 'application' }); }
      else { await api.applyForJob(job.id, user.id); await load(); setMessage('Application submitted successfully.'); addNotification({ title: 'New application received', body: `${user.name || 'A student'} applied for ${job.title}.`, type: 'application', recipient: { role: 'Recruiter', id: job.recruiter_id } }); }
    } catch (error) { setMessage(error.message || 'Could not update the application.'); }
  };
  const toggleSave = async () => {
    try {
      if (saved) { await api.removeSavedJob(user.id, job.id); setSaved(false); setMessage('Job removed from saved jobs.'); }
      else { await api.saveJob(user.id, job.id); setSaved(true); setMessage('Job saved for later.'); }
    } catch (error) { setMessage(error.message || 'Could not update saved jobs.'); }
  };

  return <div className="dashboard-screen"><Navbar workspaceLabel="Job details" /><main className="job-detail-page">{loading ? <div className="job-detail-loading"><RefreshCw className="spin-icon" size={25} /><p>Loading job details...</p></div> : !job ? <div className="job-not-found"><BriefcaseBusiness size={32} /><h1>Job not available</h1><p>This role may have been removed or paused by the recruiter.</p><Link to="/student" className="session-save-button">Back to opportunities</Link></div> : <><Link to="/student" className="back-to-jobs"><ArrowLeft size={16} /> Back to job opportunities</Link><section className="job-detail-hero"><div><span className={job.status === 'Paused' ? 'status paused' : 'status active'}>{job.status === 'Paused' ? 'Listing Paused' : 'Live opportunity'}</span><h1>{job.title}</h1><p className="job-detail-company"><Building2 size={16} /> {job.company}</p><div className="job-detail-facts"><span><MapPin size={15} /> {job.location}</span><span><Clock3 size={15} /> {job.hours}</span><span><BriefcaseBusiness size={15} /> {job.type}</span><span><IndianRupee size={15} /> {job.pay}/hour</span></div></div><div className="job-detail-actions"><button type="button" className={isAccepted ? 'detail-apply accepted' : isRejected ? 'detail-apply rejected' : 'detail-apply'} onClick={toggleApplication} disabled={isAccepted || isRejected}>{isAccepted ? <><Check size={17} /> Application accepted</> : isRejected ? <><XCircle size={17} /> Application rejected</> : application ? 'Withdraw application' : 'Apply now'}</button><button type="button" className={saved ? 'detail-save saved' : 'detail-save'} onClick={toggleSave}><Star size={17} /> {saved ? 'Saved' : 'Save job'}</button>{isRejected && <p className="job-action-message" style={{ color: '#fca5a5' }}>Your application was declined by the recruiter.</p>}{message && <p className="job-action-message">{message}</p>}</div></section><section className="job-detail-grid"><article className="job-detail-card"><p className="small-heading">ABOUT THE ROLE</p><h2>What you will do</h2><p className="job-detail-description">{job.description}</p><div className="detail-opening"><UsersRound size={18} /><div><strong>{job.vacancies} open position{Number(job.vacancies) === 1 ? '' : 's'}</strong><span>Apply early while the role is active.</span></div></div></article><aside className="recruiter-detail-card"><p className="small-heading">COMPANY PROFILE</p><div className="recruiter-detail-icon"><Building2 size={21} /></div><h2>{job.company}</h2><p>{job.industry}</p><dl><div><dt>Posted by</dt><dd>{job.recruiter_name}</dd></div><div><dt>Role</dt><dd>{job.recruiter_role}</dd></div><div><dt>Email</dt><dd>{job.recruiter_email ? <a href={`mailto:${job.recruiter_email}`}>{job.recruiter_email}</a> : 'Available after acceptance'}</dd></div></dl><Link className="company-profile-link" to={`/companies/${job.recruiter_id}`}>View company profile</Link></aside></section></>}</main></div>;
}
