import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Clock, Star, Sparkles, XCircle, PauseCircle } from 'lucide-react';

export default function JobCardStudent({
  job,
  isSaved,
  application,
  onToggleSave,
}) {
  const vacanciesCount = job.vacancies !== undefined ? Number(job.vacancies) : 1;
  const vacancyLabel = vacanciesCount === 0 ? '0 openings left' : vacanciesCount === 1 ? '1 opening' : `${vacanciesCount} openings`;
  const isAccepted = application?.status === 'Accepted';
  const isRejected = application?.status === 'Rejected';
  const isPaused = job.status === 'Paused' || vacanciesCount === 0;

  return (
    <article className={`student-job-card compact-job-card ${isAccepted ? 'card-accepted-glow' : ''} ${isRejected ? 'card-rejected-glow' : ''}`}>
      <div className="job-card-top">
        {isPaused ? (
          <span className="status paused">
            <PauseCircle size={12} style={{ marginRight: '3px', verticalAlign: '-1px' }} />
            Paused
          </span>
        ) : (
          <span className="status active">Live now</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPaused && isAccepted && (
            <span className="accepted-job-paused-pill">Positions Filled</span>
          )}
          {isAccepted ? (
            <span className="student-accepted-pill">
              <Sparkles size={12} style={{ marginRight: '4px' }} /> Accepted
            </span>
          ) : isRejected ? (
            <span className="student-rejected-pill">
              <XCircle size={12} style={{ marginRight: '4px' }} /> Rejected
            </span>
          ) : (
            <span className="opening-chip">{vacancyLabel}</span>
          )}
        </div>
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
