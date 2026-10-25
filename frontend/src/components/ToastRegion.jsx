import React from 'react';
import { Bell, BriefcaseBusiness, CalendarCheck2, CheckCircle2, Video, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const icons = { application: BriefcaseBusiness, session: Video, meeting: Video, portfolio: CheckCircle2, system: Bell };

export default function ToastRegion() {
  const { toast, dismissToast } = useNotifications();
  if (!toast) return null;
  const Icon = toast.meetingLink ? Video : (icons[toast.type] || Bell);
  const meetingHref = toast.meetingLink
    ? (toast.meetingLink.startsWith('http') ? toast.meetingLink : `https://${toast.meetingLink}`)
    : null;

  return (
    <div className="toast-region" role="status">
      <Icon size={18} />
      <div>
        <strong>{toast.title}</strong>
        <p>{toast.body}</p>
        {meetingHref && (
          <a
            href={meetingHref}
            target="_blank"
            rel="noreferrer"
            onClick={dismissToast}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '5px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0f2922',
              background: '#f3c259',
              padding: '3px 9px',
              borderRadius: '6px',
              textDecoration: 'none',
              width: 'fit-content',
              cursor: 'pointer'
            }}
          >
            Join now
          </a>
        )}
      </div>
      <button type="button" onClick={dismissToast} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
