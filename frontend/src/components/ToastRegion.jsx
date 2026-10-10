import React from 'react';
import { Bell, BriefcaseBusiness, CalendarCheck2, CheckCircle2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const icons = { application: BriefcaseBusiness, session: CalendarCheck2, portfolio: CheckCircle2, system: Bell };
export default function ToastRegion() {
  const { toast, dismissToast } = useNotifications();
  if (!toast) return null;
  const Icon = icons[toast.type] || Bell;
  return <div className="toast-region" role="status"><Icon size={18} /><div><strong>{toast.title}</strong><p>{toast.body}</p></div><button type="button" onClick={dismissToast} aria-label="Dismiss notification"><X size={16} /></button></div>;
}
