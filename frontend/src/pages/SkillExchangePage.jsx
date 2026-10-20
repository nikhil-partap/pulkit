import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Search, UsersRound, X, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { loadSkillSessions } from '../store/sessionsSlice';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function SkillExchangePage({ firstName, user }) {
  const { addNotification } = useNotifications();
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const sessions = useSelector((state) => state.sessions.items);
  const sessionStatus = useSelector((state) => state.sessions.status);
  const [bookedIds, setBookedIds] = useState([]);
  const [bookingMessage, setBookingMessage] = useState('');
  const loading = sessionStatus === 'idle' || sessionStatus === 'loading';

  useEffect(() => {
    Promise.all([dispatch(loadSkillSessions()).unwrap(), api.getBookedSkillSessions(user.id)])
      .then(([, booked]) => setBookedIds(booked.map((session) => session.id)));
  }, [dispatch, user.id]);

  const visibleSessions = useMemo(() => sessions.filter((session) => {
    const matchesQuery = `${session.title} ${session.teacher} ${session.topic}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (topic === 'All' || session.topic === topic);
  }), [sessions, query, topic]);

  const toggleJoined = async (id) => {
    const isBooked = bookedIds.includes(id);
    try {
      if (isBooked) {
        await api.cancelSkillSessionBooking(user.id, id);
        setBookedIds((current) => current.filter((item) => item !== id));
        setBookingMessage('Booking cancelled.');
        addNotification({ title: 'Booking cancelled', body: 'Your seat was released from the skill session.', type: 'session' });
      } else {
        await api.bookSkillSession(user.id, id);
        setBookedIds((current) => [...current, id]);
        setBookingMessage('Session booked. Find it under Booked sessions.');
        addNotification({ title: 'Session booked', body: 'Your Skill Exchange session is now in Booked sessions.', type: 'session' });
      }
    } catch (error) { setBookingMessage(error.message || 'Could not update this booking.'); }
  };

  return (
    <main className="student-workspace-content skill-exchange-page">
      <section className="skill-exchange-hero">
        <div>
          <p className="small-heading">PEER-TO-PEER LEARNING</p>
          <h1>Learn a skill.<br />Share a skill.</h1>
          <p>Hi <strong>{firstName}</strong>, book small, practical sessions taught by students who have already learned the skill.</p>
        </div>
        <div className="skill-hero-stat"><BookOpen size={19} /><strong>{sessions.length}</strong><span>sessions this week</span></div>
      </section>

      <section className="skill-exchange-panel">
        <div className="skill-panel-heading">
          <div><p className="small-heading">DISCOVER SESSIONS</p><h2>What do you want to learn?</h2></div>
          {bookedIds.length > 0 && <span className="joined-count">{bookedIds.length} session{bookedIds.length > 1 ? 's' : ''} booked</span>}
        </div>

        <div className="skill-tools">
          <label className="search-box skill-search" htmlFor="skillSearch"><Search size={16} /><input id="skillSearch" type="search" placeholder="Search skills or teachers" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="skill-topic-tabs" aria-label="Filter sessions by topic">
            {['All', 'Development', 'Design', 'Career'].map((item) => <button type="button" key={item} className={topic === item ? 'active' : ''} onClick={() => setTopic(item)}>{item}</button>)}
          </div>
        </div>

        {loading ? <div className="skill-empty"><p>Loading sessions...</p></div> : visibleSessions.length ? <div className="skill-session-grid">
          {visibleSessions.map((session) => {
            const isJoined = bookedIds.includes(session.id);
            const isOwnSession = Number(session.student_id) === Number(user.id);
            return <article className="skill-session-card" key={session.id}>
              <div className={`session-avatar ${session.color}`}>{session.teacher.split(' ').map((name) => name[0]).join('')}</div>
              <div className="session-card-top"><span>{session.topic}</span><small>{session.level}</small></div>
              <h3>{session.title}</h3>
              <p className="session-teacher">Hosted by {session.teacher}</p>
              <p className="session-description">{session.description}</p>
              <div className="session-meta"><span><CalendarDays size={14} />{session.time}</span><span><Clock3 size={14} />{session.duration}</span></div>
              <footer>
                <span><UsersRound size={14} />{session.seats} seats left</span>
                <div className="session-card-actions">
                  <Link
                    to={`/students/${session.student_id}`}
                    state={{ from: 'skills', fromName: 'Skill Exchange' }}
                    className="session-view-profile-btn"
                    title={`View ${session.teacher}'s profile`}
                  >
                    <UserRound size={13} />
                    <span>View profile</span>
                  </Link>
                  {isOwnSession ? (
                    <span className="own-session-label">Your session</span>
                  ) : (
                    <button
                      type="button"
                      className={isJoined ? 'session-join-button joined' : 'session-join-button'}
                      onClick={() => toggleJoined(session.id)}
                    >
                      {isJoined ? <><X size={15} /> Leave</> : 'Join session'}
                    </button>
                  )}
                </div>
              </footer>
            </article>;
          })}
        </div> : <div className="skill-empty"><Search size={23} /><h3>No sessions found</h3><p>Try a different skill or choose another topic.</p></div>}
        {bookingMessage && <p className="session-form-message">{bookingMessage}</p>}
      </section>
    </main>
  );
}
