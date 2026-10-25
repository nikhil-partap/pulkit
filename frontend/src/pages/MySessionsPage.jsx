import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Link2, PlusCircle, Send, Trash2, UsersRound, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SessionForm from '../components/SessionForm';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSkillSession, loadSkillSessions, setSkillSessionMeetingLink, updateSkillSession } from '../store/sessionsSlice';
import { useNotifications } from '../context/NotificationContext';

export default function MySessionsPage({ user, onNavigate }) {
  const dispatch = useDispatch();
  const { addNotification } = useNotifications();
  const allSessions = useSelector((state) => state.sessions.items);
  const sessionStatus = useSelector((state) => state.sessions.status);

  const sessions = useMemo(
    () => allSessions.filter((item) => Number(item.student_id) === Number(user.id)),
    [allSessions, user.id]
  );

  const [attendees, setAttendees] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Meeting Link Modal State
  const [linkModalSession, setLinkModalSession] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);
  const [linkError, setLinkError] = useState('');

  const load = async () => {
    try {
      const items = await dispatch(loadSkillSessions()).unwrap();
      const ownSessions = items.filter((item) => Number(item.student_id) === Number(user.id));
      const entries = await Promise.all(
        ownSessions.map(async (session) => [session.id, await api.getSkillSessionBookings(session.id, user.id)])
      );
      setAttendees(Object.fromEntries(entries));
    } catch (error) {
      setMessage(error.message || 'Could not load your sessions.');
    }
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener('kairos_sessions_updated', handleUpdate);
    return () => window.removeEventListener('kairos_sessions_updated', handleUpdate);
  }, [dispatch, user.id]);

  const updateSession = async (form) => {
    setSaving(true);
    setMessage('');
    try {
      await dispatch(updateSkillSession({ sessionId: selected.id, studentId: user.id, updates: form })).unwrap();
      setSelected(null);
      setMessage('Session updated.');
    } catch (error) {
      setMessage(error.message || 'Could not update the session.');
    } finally {
      setSaving(false);
    }
  };

  const removeSession = async (session) => {
    if (!window.confirm(`Delete “${session.title}”?`)) return;
    try {
      await dispatch(deleteSkillSession({ sessionId: session.id, studentId: user.id })).unwrap();
      if (selected?.id === session.id) setSelected(null);
      if (linkModalSession?.id === session.id) setLinkModalSession(null);
      setMessage('Session deleted.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const openProvideLink = (session) => {
    setLinkModalSession(session);
    setLinkUrl(session.meetingLink || '');
    setLinkError('');
  };

  const handlePushMeetingLink = async (e) => {
    e.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      setLinkError('Please enter a valid meeting URL (Google Meet, Zoom, MS Teams, etc.).');
      return;
    }

    setLinkSaving(true);
    setLinkError('');
    try {
      await dispatch(
        setSkillSessionMeetingLink({
          sessionId: linkModalSession.id,
          studentId: user.id,
          meetingLink: trimmed,
        })
      ).unwrap();

      let sessionAttendees = attendees[linkModalSession.id];
      if (!sessionAttendees || !sessionAttendees.length) {
        try {
          sessionAttendees = await api.getSkillSessionBookings(linkModalSession.id, user.id);
        } catch {
          sessionAttendees = [];
        }
      }

      // 1. Push notification only to booked learners (not to the host providing the link)
      sessionAttendees
        .filter((attendee) => Number(attendee.studentId) !== Number(user.id))
        .forEach((attendee) => {
          addNotification({
            title: 'Meeting link is provided, join fast!',
            body: `Meeting link is provided for "${linkModalSession.title}". Join fast!`,
            type: 'session',
            meetingLink: trimmed,
            recipient: { role: 'Student', id: attendee.studentId },
          });
        });

      window.dispatchEvent(new Event('kairos_sessions_updated'));
      setMessage(`Meeting link published and pushed to ${sessionAttendees.length} booked learner${sessionAttendees.length === 1 ? '' : 's'}.`);
      setLinkModalSession(null);
    } catch (err) {
      setLinkError(err.message || 'Could not publish meeting link.');
    } finally {
      setLinkSaving(false);
    }
  };

  return (
    <main className="student-workspace-content session-page">
      <section className="session-page-header">
        <div>
          <p className="small-heading">YOUR TEACHING SPACE</p>
          <h1>My skill sessions</h1>
          <p>Update your sessions and provide meeting links to enrolled students. Only booked learners can access your link.</p>
        </div>
        <button type="button" className="new-session-button" onClick={() => onNavigate('create-session')}>
          <PlusCircle size={16} /> New session
        </button>
      </section>

      <section className="my-sessions-panel">
        {message && <p className="session-form-message">{message}</p>}
        {sessionStatus === 'idle' || sessionStatus === 'loading' ? (
          <p className="session-loading">Loading your sessions...</p>
        ) : !sessions.length ? (
          <div className="my-sessions-empty">
            <h2>No sessions yet</h2>
            <p>Your first practical session could help another student make progress.</p>
            <button type="button" className="session-save-button" onClick={() => onNavigate('create-session')}>
              Create a session
            </button>
          </div>
        ) : (
          <div className="my-sessions-list">
            {sessions.map((session) => {
              const sessionLearners = attendees[session.id] || [];
              const hasLink = Boolean(session.meetingLink);

              return (
                <article
                  className={selected?.id === session.id ? 'my-session-row selected' : 'my-session-row'}
                  key={session.id}
                >
                  <div className={`session-avatar ${session.color}`}>
                    {session.teacher.split(' ').map((name) => name[0]).join('')}
                  </div>

                  <div className="my-session-content">
                    <span>{session.topic} · {session.level}</span>
                    <h3>{session.title}</h3>
                    <p>{session.time} · {session.duration} · {session.seats} seats</p>

                    {/* Meeting Link Status Display */}
                    {hasLink ? (
                      <div className="session-active-link-indicator">
                        <Video size={13} />
                        <span>Meeting link shared:</span>
                        <a
                          href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {session.meetingLink}
                        </a>
                      </div>
                    ) : (
                      <div className="session-pending-link-indicator">
                        <Link2 size={13} />
                        <span>No link provided yet (booked learners see: "Link will be given to you soon.")</span>
                      </div>
                    )}

                    {sessionLearners.length > 0 && (
                      <div className="session-attendee-list">
                        <strong>
                          <UsersRound size={14} /> Booked learners ({sessionLearners.length})
                        </strong>
                        {sessionLearners.map((attendee) => (
                          <Link
                            key={attendee.bookingId}
                            to={`/students/${attendee.studentId}`}
                            state={{ from: '/student?tab=my-sessions', fromName: 'My sessions', activePage: 'my-sessions' }}
                          >
                            <span>{attendee.name}</span>
                            <small>{attendee.course} · {attendee.college}</small>
                            <b>View portfolio</b>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="my-session-actions">
                    <button
                      type="button"
                      className="provide-link-button"
                      onClick={() => openProvideLink(session)}
                      title="Provide meeting link to booked students"
                    >
                      <Video size={14} /> {hasLink ? 'Update link' : 'Provide link'}
                    </button>
                    <button type="button" onClick={() => setSelected(session)}>
                      <Edit3 size={15} /> Edit
                    </button>
                    <button type="button" className="delete-session-button" onClick={() => removeSession(session)}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Session Panel */}
      {selected && (
        <section className="session-form-panel edit-session-panel">
          <p className="small-heading">EDIT SESSION</p>
          <h2>Update “{selected.title}”</h2>
          <SessionForm
            initialSession={selected}
            submitLabel="Save changes"
            onSubmit={updateSession}
            onCancel={() => setSelected(null)}
            saving={saving}
          />
        </section>
      )}

      {/* Provide Meeting Link Modal */}
      {linkModalSession && (
        <div className="provide-link-modal-overlay" onClick={() => setLinkModalSession(null)}>
          <div className="provide-link-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="provide-link-modal-header">
              <h2>Provide link</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setLinkModalSession(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePushMeetingLink} className="provide-link-form">
              <label>
                Meeting URL (Google Meet, Zoom, MS Teams, etc.)
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  autoFocus
                />
              </label>

              {linkError && <p className="provide-link-error">{linkError}</p>}

              <div className="provide-link-modal-actions">
                <button
                  type="button"
                  className="session-cancel-button"
                  onClick={() => setLinkModalSession(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="session-save-button push-link-btn"
                  disabled={linkSaving}
                >
                  <Send size={15} /> {linkSaving ? 'Sending...' : 'Send link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
