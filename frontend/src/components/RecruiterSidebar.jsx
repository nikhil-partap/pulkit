import React, { useEffect, useState } from 'react';
import {
  BriefcaseBusiness, ChevronDown, ChevronRight,
  LogOut, Moon, Settings, Sun, UserRound, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function RecruiterSidebar({ activePage, onChange, pendingCount = 0 }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); signOut(); }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <aside className="recruiter-sidebar" aria-label="Recruiter workspace navigation">
      <p className="recruiter-sidebar-label">WORKSPACE</p>

      <nav>
        <button
          type="button"
          className={activePage === 'listings' || activePage === 'jobs' || activePage === 'post-job' ? 'active' : ''}
          onClick={() => onChange('listings')}
        >
          <BriefcaseBusiness size={18} />
          <span>My listings</span>
          <ChevronRight size={15} />
        </button>
        <button
          type="button"
          className={activePage === 'applicants' ? 'active' : ''}
          onClick={() => onChange('applicants')}
        >
          <Users size={18} />
          <span>Applicants</span>
          {pendingCount > 0 && (
            <span style={{ marginLeft: 'auto', marginRight: '6px', fontSize: '11px', background: 'var(--accent-gold)', color: '#163d36', padding: '1px 7px', borderRadius: '10px', fontWeight: 800 }}>
              {pendingCount}
            </span>
          )}
          <ChevronRight size={15} />
        </button>
      </nav>

      {/* Settings */}
      <div className="student-sidebar-settings">
        <button
          type="button"
          className={settingsOpen ? 'sidebar-settings-trigger active' : 'sidebar-settings-trigger'}
          onClick={() => setSettingsOpen((o) => !o)}
          aria-expanded={settingsOpen}
        >
          <Settings size={18} />
          <span>Settings</span>
          <ChevronDown size={15} />
        </button>
        {settingsOpen && (
          <div className="sidebar-settings-menu">
            <button type="button" onClick={() => navigate('/settings')}>
              <UserRound size={15} /> Edit profile
            </button>
            <div className="sidebar-theme-row">
              <button type="button" className={`sidebar-theme-option${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}><Sun size={13} /> Light</button>
              <button type="button" className={`sidebar-theme-option${theme === 'dark' ? ' active' : ''}`} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}><Moon size={13} /> Dark</button>
            </div>
            <button type="button" className="sidebar-logout" onClick={signOut}>
              <LogOut size={15} /> Log out <small>Ctrl + B</small>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
