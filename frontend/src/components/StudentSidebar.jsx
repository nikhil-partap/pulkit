import React, { useEffect, useState } from 'react';
import { BookOpen, BriefcaseBusiness, CalendarCheck2, ChevronDown, ChevronRight, FilePenLine, FileText, LayoutDashboard, LogOut, Moon, PlusCircle, Presentation, Settings, Sun, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function StudentSidebar({ activePage, onChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [needsPortfolio, setNeedsPortfolio] = useState(false);
  const { user, logout } = useAuth();
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

  useEffect(() => {
    api.getStudentPortfolio(user.id)
      .then((portfolio) => setNeedsPortfolio(!portfolio.skills.length && !portfolio.projects.length))
      .catch(() => setNeedsPortfolio(false));
  }, [user.id]);

  const pageLabels = {
    jobs: 'Job opportunities',
    skills: 'Skill Exchange',
    applications: 'My applications',
    'booked-sessions': 'Booked sessions',
    'create-session': 'Create session',
    'my-sessions': 'My sessions',
  };
  const returnPath = activePage && activePage !== 'jobs' ? `/student?tab=${activePage}` : '/student';
  const returnName = pageLabels[activePage] || 'workspace';
  const navState = { from: returnPath, fromName: returnName, activePage };

  return (
    <aside className="student-sidebar" aria-label="Student workspace navigation">
      <p className="student-sidebar-label">WORKSPACE</p>
      <nav>
        <button type="button" className={activePage === 'jobs' ? 'active' : ''} onClick={() => onChange('jobs')}><BriefcaseBusiness size={18} /><span>Job opportunities</span><ChevronRight size={15} /></button>
        <button type="button" className={activePage === 'applications' ? 'active' : ''} onClick={() => onChange('applications')}><FileText size={18} /><span>My applications</span><ChevronRight size={15} /></button>
        <button type="button" className={activePage === 'skills' ? 'active' : ''} onClick={() => onChange('skills')}><BookOpen size={18} /><span>Skill exchange</span><ChevronRight size={15} /></button>
        <button type="button" className={activePage === 'booked-sessions' ? 'active' : ''} onClick={() => onChange('booked-sessions')}><CalendarCheck2 size={18} /><span>Booked sessions</span><ChevronRight size={15} /></button>
        <button type="button" className={activePage === 'create-session' ? 'active' : ''} onClick={() => onChange('create-session')}><PlusCircle size={18} /><span>Create session</span><ChevronRight size={15} /></button>
        <button type="button" className={activePage === 'my-sessions' ? 'active' : ''} onClick={() => onChange('my-sessions')}><Presentation size={18} /><span>My sessions</span><ChevronRight size={15} /></button>
      </nav>
      <div className="student-sidebar-note"><LayoutDashboard size={17} /><p><strong>More coming soon</strong><br />Applications and your profile will appear here.</p></div>
      {needsPortfolio && <button type="button" className="complete-portfolio-nudge" onClick={() => navigate('/portfolio/edit', { state: navState })}><FilePenLine size={16} /><span><strong>Complete your portfolio</strong><small>Add skills or a first project</small></span></button>}
      <div className="student-sidebar-settings">
        <button type="button" className={settingsOpen ? 'sidebar-settings-trigger active' : 'sidebar-settings-trigger'} onClick={() => setSettingsOpen((open) => !open)} aria-expanded={settingsOpen}><Settings size={18} /><span>Settings</span><ChevronDown size={15} /></button>
        {settingsOpen && <div className="sidebar-settings-menu">
          <button type="button" onClick={() => navigate('/settings', { state: navState })}><Settings size={15} /> Account</button>
          <button type="button" onClick={() => navigate('/portfolio/edit', { state: navState })}><FilePenLine size={15} /> Edit portfolio</button>
          <button type="button" onClick={() => navigate('/profile', { state: navState })}><UserRound size={15} /> View portfolio</button>
          <div className="sidebar-theme-row">
            <button type="button" className={`sidebar-theme-option${theme === 'light' ? ' active' : ''}`} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}><Sun size={13} /> Light</button>
            <button type="button" className={`sidebar-theme-option${theme === 'dark' ? ' active' : ''}`} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}><Moon size={13} /> Dark</button>
          </div>
          <button type="button" className="sidebar-logout" onClick={signOut}><LogOut size={15} /> Log out <small>Ctrl + B</small></button>
        </div>}
      </div>
    </aside>
  );
}
