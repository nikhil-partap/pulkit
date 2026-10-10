import React, { createContext, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

const starterNotifications = [
  { id: 'welcome', title: 'Welcome to Kairos', body: 'Your workspace is ready. Explore jobs, skills, and your portfolio.', type: 'system', read: false, createdAt: Date.now() - 1000 * 60 * 30 },
  { id: 'skills', title: 'Skill Exchange is live', body: 'Find short peer-led sessions or share a skill you know.', type: 'session', read: true, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(starterNotifications);
  const [toast, setToast] = useState(null);
  const addNotification = ({ title, body, type = 'system' }) => {
    const item = { id: `${Date.now()}-${Math.random()}`, title, body, type, read: false, createdAt: Date.now() };
    setNotifications((current) => [item, ...current]);
    setToast(item);
    window.setTimeout(() => setToast((current) => current?.id === item.id ? null : current), 3800);
  };
  const markRead = (id) => setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllRead = () => setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  const unreadCount = notifications.filter((item) => !item.read).length;
  const value = useMemo(() => ({ notifications, unreadCount, toast, addNotification, markRead, markAllRead, dismissToast: () => setToast(null) }), [notifications, toast, unreadCount]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider.');
  return context;
}
