import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCheck,
  FilePenLine,
  FileText,
  Info,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Presentation,
  Settings,
  Sun,
  UserRound,
  X
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ workspaceLabel, activePage, onNavChange }) {
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const menuBtnRef = useRef(null);

  const signOut = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !menuBtnRef.current?.contains(event.target)
      ) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { key: 'jobs', label: 'Job opportunities', desc: 'Explore open student positions', icon: BriefcaseBusiness },
    { key: 'skills', label: 'Skill exchange', desc: 'Browse & join peer learning sessions', icon: BookOpen },
    { key: 'applications', label: 'My applications', desc: 'Track your submitted applications', icon: FileText },
    { key: 'booked-sessions', label: 'Booked sessions', desc: 'View upcoming registered sessions', icon: CalendarCheck2 },
    { key: 'create-session', label: 'Create session', desc: 'Host a new peer skill session', icon: PlusCircle },
    { key: 'my-sessions', label: 'My sessions', desc: 'Manage sessions you teach', icon: Presentation }
  ];

  return (
    <div className="navbar-wrapper">
      <header className="dashboard-header">
        <Link
          to="/"
          className="dashboard-brand"
          aria-label="Go to Kairos landing page"
          onClick={(event) => {
            event.preventDefault();
            window.location.hash = '/';
          }}
        >
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos" className="dashboard-brand-logo-img" />
          <span>Kairos<span className="brand-dot">.</span></span>
        </Link>

        {workspaceLabel && <span className="workspace-label">{workspaceLabel}</span>}

        <div className="header-workspace-actions">
          <div className="header-notification-wrap" ref={menuRef}>
            <button
              className="header-notification-link"
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-label="Open notifications"
              aria-expanded={open}
            >
              <Bell size={18} />
              {unreadCount > 0 && <b>{unreadCount}</b>}
            </button>

            {open && (
              <div className="notification-popover">
                <div className="notification-popover-heading">
                  <div>
                    <strong>Notifications</strong>
                    <span>{unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}</span>
                  </div>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllRead}>
                      <CheckCheck size={14} /> Read all
                    </button>
                  )}
                </div>
                <div className="notification-popover-list">
                  {notifications.length ? (
                    notifications.slice(0, 5).map((item) => (
                      <button
                        type="button"
                        className={item.read ? 'popover-notification' : 'popover-notification unread'}
                        key={item.id}
                        onClick={() => markRead(item.id)}
                      >
                        <Info size={14} />
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.body}</small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p>No notifications yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {onNavChange && (
            <button
              ref={menuBtnRef}
              className={`header-mobile-menu-btn ${drawerOpen ? 'active' : ''}`}
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      {onNavChange && drawerOpen && (
        <div className="mobile-nav-drawer" ref={drawerRef}>
          <div className="mobile-nav-drawer-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`drawer-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onNavChange(item.key);
                    setDrawerOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </div>
                </button>
              );
            })}

            <div className="drawer-divider" />

            <div className="drawer-section-title">ACCOUNT & SETTINGS</div>

            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                navigate('/settings');
                setDrawerOpen(false);
              }}
            >
              <Settings size={18} />
              <div>
                <strong>Settings</strong>
                <small>Account settings & preferences</small>
              </div>
            </button>

            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                navigate('/profile');
                setDrawerOpen(false);
              }}
            >
              <UserRound size={18} />
              <div>
                <strong>View portfolio</strong>
                <small>Your public student profile</small>
              </div>
            </button>

            <button
              type="button"
              className="drawer-link"
              onClick={() => {
                navigate('/portfolio/edit');
                setDrawerOpen(false);
              }}
            >
              <FilePenLine size={18} />
              <div>
                <strong>Edit portfolio</strong>
                <small>Update skills, resume & projects</small>
              </div>
            </button>

            <div className="drawer-theme-toggle">
              <span className="drawer-theme-label">Appearance</span>
              <div className="drawer-theme-buttons">
                <button
                  type="button"
                  className={`drawer-theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  aria-pressed={theme === 'light'}
                >
                  <Sun size={13} /> Light
                </button>
                <button
                  type="button"
                  className={`drawer-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  aria-pressed={theme === 'dark'}
                >
                  <Moon size={13} /> Dark
                </button>
              </div>
            </div>

            <button
              type="button"
              className="drawer-link drawer-logout"
              onClick={() => {
                setDrawerOpen(false);
                signOut();
              }}
            >
              <LogOut size={18} />
              <div>
                <strong>Log out</strong>
                <small>Sign out of your account</small>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
