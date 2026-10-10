import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ workspaceLabel }) {
  const { unreadCount } = useNotifications();
  const { notifications, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="dashboard-header">
      <Link to="/" className="dashboard-brand" aria-label="Go to Kairos landing page" onClick={(event) => { event.preventDefault(); window.location.hash = '/'; }}>
        <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos" className="dashboard-brand-logo-img" />
        <span>Kairos<span className="brand-dot">.</span></span>
      </Link>
      {workspaceLabel && <span className="workspace-label">{workspaceLabel}</span>}

      {/* Notifications */}
      <div className="header-notification-wrap" ref={menuRef}>
        <button className="header-notification-link" type="button" onClick={() => setOpen((current) => !current)} aria-label="Open notifications" aria-expanded={open}><Bell size={18} />{unreadCount > 0 && <b>{unreadCount}</b>}</button>
        {open && <div className="notification-popover"><div className="notification-popover-heading"><div><strong>Notifications</strong><span>{unreadCount ? `${unreadCount} unread` : 'You\u2019re all caught up'}</span></div>{unreadCount > 0 && <button type="button" onClick={markAllRead}><CheckCheck size={14} /> Read all</button>}</div><div className="notification-popover-list">{notifications.length ? notifications.slice(0, 5).map((item) => <button type="button" className={item.read ? 'popover-notification' : 'popover-notification unread'} key={item.id} onClick={() => markRead(item.id)}><Info size={14} /><span><strong>{item.title}</strong><small>{item.body}</small></span></button>) : <p>No notifications yet.</p>}</div></div>}
      </div>
    </header>
  );
}
