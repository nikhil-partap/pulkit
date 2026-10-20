import React, { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarDays, Clock3, UsersRound, Video, X } from 'lucide-react';
import { api } from '../services/api';

export default function BookedSessionsPage({ user, onNavigate }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setSessions(await api.getBookedSkillSessions(user.id));
    } catch (error) {
      setMessage(error.message || 'Could not load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener('kairos_sessions_updated', handleUpdate);
    return () => window.removeEventListener('kairos_sessions_updated', handleUpdate);
  }, [user.id]);

  const cancel = async (session) => {
    try {
      await api.cancelSkillSessionBooking(user.id, session.id);
      setSessions((current) => current.filter((item) => item.id !== session.id));
      setMessage('Booking cancelled.');
    } catch (error) {
      setMessage(error.message || 'Could not cancel this booking.');
    }
  };

  return (
    <main className="student-workspace-content session-page">
      <section className="session-page-header booked-page-header">
        <div>
          <p className="small-heading">YOUR LEARNING PLAN</p>
          <h1>Booked sessions</h1>
          <p>These are the peer-learning sessions you have saved a seat in. Meeting links appear here once provided by the host.</p>
        </div>
        <CalendarCheck2 size={40} />
      </section>

      <section className="my-sessions-panel booked-sessions-panel">
        {message && <p className="session-form-message">{message}</p>}

        {loading ? (
          <p className="session-loading">Loading your booked sessions...</p>
        ) : !sessions.length ? (
          <div className="my-sessions-empty">
            <h2>Nothing booked yet</h2>
            <p>Explore practical sessions taught by fellow students and reserve a seat.</p>
            <button type="button" className="session-save-button" onClick={() => onNavigate('skills')}>
              Explore Skill Exchange
            </button>
          </div>
        ) : (
          <div className="booked-sessions-grid">
            {sessions.map((session) => (
              <article className="booked-session-card" key={session.id}>
                <div className={`session-avatar ${session.color}`}>
                  {session.teacher.split(' ').map((name) => name[0]).join('')}
                </div>
                <p className="small-heading">{session.topic} · {session.level}</p>
                <h2>{session.title}</h2>
                <p className="session-teacher">Hosted by {session.teacher}</p>
                <p className="session-description">{session.description}</p>

                <div className="session-meta">
                  <span>
                    <CalendarDays size={14} />
                    {session.time}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {session.duration}
                  </span>
                  <span>
                    <UsersRound size={14} />
                    {session.seats} seats left
                  </span>
                </div>

                {/* Meeting Link Section - Private to booked learners */}
                <div className="booked-session-meeting-box">
                  {session.meetingLink ? (
                    <div className="meeting-link-available">
                      <div className="meeting-link-status-badge">
                        <Video size={13} /> Meeting link ready
                      </div>
                      <a
                        href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-meeting-btn"
                      >
                        <Video size={14} /> Join meeting
                      </a>
                    </div>
                  ) : (
                    <div className="meeting-link-pending">
                      <Clock3 size={14} />
                      <span>Link will be given to you soon.</span>
                    </div>
                  )}
                </div>

                <button type="button" className="cancel-booking-button" onClick={() => cancel(session)}>
                  <X size={15} /> Cancel booking
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
