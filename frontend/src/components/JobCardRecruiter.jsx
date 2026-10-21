import React from 'react';
import { Mail, Users, Trash2, Power, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function JobCardRecruiter({
  job,
  applications,
  onToggleStatus,
  onDeleteJob,
  onAcceptApplicant,
  onRejectApplicant,
}) {
  const jobApps = applications.filter((app) => app.job_id === job.id);
  const vacanciesCount = job.vacancies !== undefined ? Number(job.vacancies) : 1;

  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className={`status ${job.status?.toLowerCase()}`}>
          {job.status}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="job-action"
            onClick={() => onToggleStatus(job.id, job.status)}
            title={job.status === 'Active' ? 'Pause listings' : 'Activate listings'}
          >
            <Power size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            {job.status === 'Active' ? 'Pause' : 'Activate'}
          </button>

          <button
            type="button"
            className="job-action remove-job"
            onClick={() => onDeleteJob(job.id)}
            title="Delete this listing"
          >
            <Trash2 size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            Remove
          </button>
        </div>
      </div>

      <h3>{job.title}</h3>
      <p className="job-meta">
        {job.type} · {job.location}
      </p>

      <p className="job-pay">
        {job.pay?.startsWith('₹') || job.pay?.startsWith('Rs') ? job.pay : `₹${job.pay}`}{' '}
        <span>· {job.hours}</span>
      </p>

      <p className="vacancy-note">
        {vacanciesCount === 0
          ? '0 vacancies left (Auto-paused)'
          : `${vacanciesCount} ${vacanciesCount === 1 ? 'vacancy' : 'vacancies'} available`}
      </p>

      <p className="job-description">{job.description}</p>
      <p className="job-posted">Posted {job.posted || 'recently'}</p>

      {/* Applicants Section */}
      <div className="applicants-section">
        <div className="applicants-title">
          <Users size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          Applicants ({jobApps.length})
        </div>

        {jobApps.length === 0 ? (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
            No student applicants yet.
          </p>
        ) : (
          <div className="applicants-list">
            {jobApps.map((app) => {
              const isAccepted = app.status === 'Accepted';
              const isRejected = app.status === 'Rejected';
              return (
                <div key={app.application_id || `${app.job_id}-${app.student_id}`} className="applicant-card">
                  <div className="applicant-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong>{app.student_name}</strong>
                      <span className={`applicant-status-badge ${isAccepted ? 'status-accepted' : isRejected ? 'status-rejected' : 'status-pending'}`}>
                        {isAccepted ? <><Check size={12} /> Accepted</> : isRejected ? <><X size={12} /> Rejected</> : 'Under Review'}
                      </span>
                    </div>
                    <p>
                      {app.college} · {app.course} · {app.availability || 'Flexible'}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                      Applied {app.applied_at}
                    </p>
                  </div>

                  <div className="applicant-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {!isAccepted && !isRejected && (
                      <>
                        <button
                          type="button"
                          className="accept-applicant-btn"
                          onClick={() => onAcceptApplicant && onAcceptApplicant(app.application_id)}
                          title="Accept this student's application"
                        >
                          <Check size={13} style={{ marginRight: '4px' }} />
                          Accept Application
                        </button>

                        <button
                          type="button"
                          className="reject-applicant-btn"
                          onClick={() => onRejectApplicant && onRejectApplicant(app.application_id)}
                          title="Reject this student's application"
                        >
                          <X size={13} style={{ marginRight: '4px' }} />
                          Reject Application
                        </button>
                      </>
                    )}

                    <a href={`mailto:${app.student_email}`} className="contact-student-btn" title="Send Email">
                      <Mail size={12} style={{ marginRight: '4px' }} />
                      Email
                    </a>
                    <Link to={`/students/${app.student_id}`} state={{ from: 'recruiter', fromName: 'Recruiter' }} className="view-applicant-portfolio">View portfolio</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
