import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
const getAccountKey = (account) => account ? `${account.role}-${account.id}` : null;

const createStarterNotifications = () => [
  { id: 'welcome', title: 'Welcome to Kairos', body: 'Your workspace is ready. Explore jobs, skills, and your portfolio.', type: 'system', read: false, createdAt: Date.now() - 1000 * 60 * 30 },
  { id: 'skills', title: 'Skill Exchange is live', body: 'Find short peer-led sessions or share a skill you know.', type: 'session', read: true, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
];

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const accountKey = getAccountKey(user);
  const [notificationsByAccount, setNotificationsByAccount] = useState({});
  const [toast, setToast] = useState(null);
  const notifications = accountKey ? (notificationsByAccount[accountKey] || createStarterNotifications()) : [];

  useEffect(() => {
    setToast(null);
  }, [accountKey]);

  const updateAccount = (targetKey, updater) => {
    if (!targetKey) return;
    setNotificationsByAccount((current) => {
      const existing = current[targetKey] || createStarterNotifications();
      return { ...current, [targetKey]: updater(existing) };
    });
  };

  const addNotification = ({ title, body, type = 'system', recipient }) => {
    const targetKey = recipient ? getAccountKey(recipient) : accountKey;
    if (!targetKey) return;
    const item = { id: `${Date.now()}-${Math.random()}`, title, body, type, read: false, createdAt: Date.now() };
    updateAccount(targetKey, (current) => [item, ...current]);
    if (targetKey === accountKey) setToast({ ...item, accountKey: targetKey });
    window.setTimeout(() => setToast((current) => current?.id === item.id ? null : current), 3800);
  };
  const markRead = (id) => updateAccount(accountKey, (current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllRead = () => updateAccount(accountKey, (current) => current.map((item) => ({ ...item, read: true })));
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visibleToast = toast?.accountKey === accountKey ? toast : null;
  const value = useMemo(() => ({ notifications, unreadCount, toast: visibleToast, addNotification, markRead, markAllRead, dismissToast: () => setToast(null) }), [notifications, unreadCount, visibleToast]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider.');
  return context;
}
