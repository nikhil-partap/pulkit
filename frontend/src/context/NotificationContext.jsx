import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);
const getAccountKey = (account) => account ? `${account.role}-${account.id}` : null;
const STORAGE_KEY = 'kairos_notifications_by_account';

const createStarterNotifications = () => [
  { id: 'welcome', title: 'Welcome to Kairos', body: 'Your workspace is ready. Explore jobs, skills, and your portfolio.', type: 'system', read: false, createdAt: Date.now() - 1000 * 60 * 30 },
  { id: 'skills', title: 'Skill Exchange is live', body: 'Find short peer-led sessions or share a skill you know.', type: 'session', read: true, createdAt: Date.now() - 1000 * 60 * 60 * 4 },
];

const loadStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.keys(parsed).forEach((key) => {
        if (Array.isArray(parsed[key])) {
          parsed[key] = parsed[key].filter(
            (item) => item.title !== 'Session booked' && item.title !== 'Booking cancelled'
          );
        }
      });
      return parsed;
    }
  } catch {}
  return {};
};

const saveStoredNotifications = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const accountKey = getAccountKey(user);
  const [notificationsByAccount, setNotificationsByAccount] = useState(() => loadStoredNotifications());
  const [toast, setToast] = useState(null);
  const notifications = accountKey
    ? (notificationsByAccount[accountKey] || createStarterNotifications()).filter(
        (item) => item.title !== 'Session booked' && item.title !== 'Booking cancelled'
      )
    : [];

  useEffect(() => {
    setToast(null);
  }, [accountKey]);

  useEffect(() => {
    const handleSync = (event) => {
      const stored = loadStoredNotifications();
      setNotificationsByAccount(stored);
      if (event?.detail?.targetKey === accountKey && event?.detail?.item) {
        const item = event.detail.item;
        setToast({ ...item, accountKey });
        window.setTimeout(() => setToast((current) => current?.id === item.id ? null : current), 4500);
      }
    };
    window.addEventListener('kairos_notification_added', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('kairos_notification_added', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [accountKey]);

  const updateAccount = (targetKey, updater) => {
    if (!targetKey) return;
    setNotificationsByAccount((current) => {
      const stored = loadStoredNotifications();
      const merged = { ...stored, ...current };
      const existing = (merged[targetKey] || createStarterNotifications()).filter(
        (item) => item.title !== 'Session booked' && item.title !== 'Booking cancelled'
      );
      const updated = { ...merged, [targetKey]: updater(existing) };
      saveStoredNotifications(updated);
      return updated;
    });
  };

  const addNotification = ({ title, body, type = 'system', recipient, meetingLink }) => {
    const targetKey = recipient ? getAccountKey(recipient) : accountKey;
    if (!targetKey) return;
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      body,
      type,
      meetingLink,
      read: false,
      createdAt: Date.now()
    };
    updateAccount(targetKey, (current) => [item, ...current]);

    // Native browser push notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, { body });
        } catch {}
      } else if (Notification.permission === 'default') {
        try {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') new Notification(title, { body });
          });
        } catch {}
      }
    }

    // Broadcast event for live cross-tab toasts
    window.dispatchEvent(new CustomEvent('kairos_notification_added', { detail: { targetKey, item } }));

    if (targetKey === accountKey) {
      setToast({ ...item, accountKey: targetKey });
      window.setTimeout(() => setToast((current) => current?.id === item.id ? null : current), 4500);
    }
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
