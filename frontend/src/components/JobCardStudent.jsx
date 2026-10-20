import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Clock, Star, Sparkles, XCircle } from 'lucide-react';

export default function JobCardStudent({
  job,
  isSaved,
  application,
  onToggleSave,
}) {
  const vacanciesCount = Number(job.vacancies || 1);
  const vacancyLabel = vacanciesCount === 1 ? '1 opening' : `${vacanciesCount} openings`;
  const isAccepted = application?.status === 'Accepted';
  const isRejected = application?.status === 'Rejected';

  return (
    <article className={`student-job-card compact-job-card ${isAccepted ? 'card-accepted-glow' : ''} ${isRejected ? 'card-rejected-glow' : ''}`}>
      <div className="job-card-top">
        <span className="status active">Live now</span>
        {isAccepted ? (
          <span className="student-accepted-pill">
            <Sparkles size={12} style={{ marginRight: '4px' }} /> Accepted
          </span>
        ) : isRejected ? (
          <span className="student-rejected-pill">
            <XCircle size={12} style={{ marginRight: '4px' }} /> Application Rejected
          </span>
        ) : (
          <span className="opening-chip">{vacancyLabel}</span>
        )}
      </div>

      <div className="compact-job-heading">
        <span className="company-mark">{(job.company || 'Kairos Employer').split(' ').map((word) => word[0]).join('').slice(0, 2)}</span>
        <div>
          <h3>{job.title}</h3>
          <p className="company-line">{job.company || 'Kairos Employer'} <BadgeCheck size={14} aria-label="Verified employer" /></p>
        </div>
      </div>

      <div className="job-facts">
        <span>
          <MapPin size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
          {job.location}
        </span>
        <span>
          <Clock size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
          {job.hours}
        </span>
        <span>
          {job.pay?.startsWith('₹') || job.pay?.startsWith('Rs') ? job.pay : `₹${job.pay}`} / hour
        </span>
      </div>
      <p className="compact-job-note">{job.type || 'On-site'} · Posted recently</p>

      {isAccepted && (
        <div className="student-accepted-callout">
          <strong>Application Accepted!</strong>
          <p>The hiring team accepted your application. You will be contacted via your registered email.</p>
        </div>
      )}

      {isRejected && (
        <div className="student-rejected-callout">
          <strong>Application Not Selected</strong>
          <p>The recruiter has reviewed your application and decided not to proceed for this role.</p>
        </div>
      )}

      <div className="job-card-actions">
        <Link to={`/jobs/${job.id}`} className="job-details-link">View details <span>→</span></Link>

        <button
          type="button"
          className={`interest-button save-button ${isSaved ? 'saved' : ''}`}
          onClick={() => onToggleSave(job.id)}
          style={{ marginTop: 0 }}
        >
          <Star size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  );
}
