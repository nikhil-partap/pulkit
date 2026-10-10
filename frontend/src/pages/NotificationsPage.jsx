import React from 'react';
import { Bell, BriefcaseBusiness, CalendarCheck2, CheckCircle2, CircleCheck, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const icons = { application: BriefcaseBusiness, session: CalendarCheck2, portfolio: CheckCircle2, system: Info };
function relativeTime(timestamp) { const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000)); return minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`; }
export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { user } = useAuth();
  const recruiter = user?.role === 'Recruiter';
  return <div className="dashboard-screen"><main className="notifications-standalone"><section className="notifications-hero"><div><p className="small-heading">STAY IN THE LOOP</p><h1>Notifications</h1><p>{recruiter ? 'New applications, job activity, and candidate updates will appear here.' : 'Job applications, skill sessions, and portfolio updates will appear here.'}</p></div><div className="notification-count"><Bell size={20} /><strong>{unreadCount}</strong><span>unread updates</span></div></section><section className="notifications-panel"><div className="notifications-panel-heading"><div><p className="small-heading">YOUR ACTIVITY</p><h2>Latest updates</h2></div>{unreadCount > 0 && <button type="button" onClick={markAllRead}><CircleCheck size={15} /> Mark all as read</button>}</div>{notifications.length ? <div className="notification-list">{notifications.map((item) => { const Icon = icons[item.type] || Info; return <button type="button" className={item.read ? 'notification-item' : 'notification-item unread'} key={item.id} onClick={() => markRead(item.id)}><span className={`notification-icon ${item.type}`}><Icon size={17} /></span><span><strong>{item.title}</strong><p>{item.body}</p></span><time>{relativeTime(item.createdAt)}</time></button>; })}</div> : <div className="notifications-empty"><Bell size={25} /><h3>No updates yet</h3><p>We will let you know when something important happens.</p></div>}</section></main></div>;
}
