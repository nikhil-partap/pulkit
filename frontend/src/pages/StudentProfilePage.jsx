import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FolderKanban, GitFork, GraduationCap, Link2, MapPin, RefreshCw, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function StudentProfilePage({ ownProfile = false }) {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const targetId = ownProfile ? user.id : studentId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (location.state?.from && typeof location.state.from === 'string' && location.state.from.startsWith('/')) {
      navigate(location.state.from, { state: { activePage: location.state.activePage } });
      return;
    }
    if (location.state?.from === 'skills') {
      navigate('/student?tab=skills', { state: { activePage: 'skills' } });
      return;
    }
    if (location.state?.from === 'recruiter') {
      const activeTab = location.state?.activePage || (location.state?.fromName === 'Applicants' ? 'applicants' : 'listings');
      navigate(activeTab === 'applicants' ? '/recruiter?tab=applicants' : '/recruiter', { state: { activePage: activeTab } });
      return;
    }
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
      return;
    }
    if (user?.role === 'Recruiter') {
      navigate('/recruiter');
    } else {
      navigate('/student');
    }
  };

  const getBackLabel = () => {
    if (location.state?.fromName) {
      return `Back to ${location.state.fromName}`;
    }
    if (location.state?.from === 'skills') {
      return 'Back to Skill Exchange';
    }
    if (user?.role === 'Recruiter') {
      return 'Back to recruiter workspace';
    }
    return 'Back to workspace';
  };

  useEffect(() => {
    setLoading(true); setError('');
    api.getStudentPortfolio(targetId).then(setProfile).catch((requestError) => setError(requestError.message || 'Could not load this portfolio.')).finally(() => setLoading(false));
  }, [targetId]);
  const downloadResume = () => {
    if (!profile?.resumeFile) return;
    const url = URL.createObjectURL(profile.resumeFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = profile.resumeFile.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const studentName = profile?.name?.trim() || 'Student';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST';

  return (
    <div className="dashboard-screen">
      <Navbar workspaceLabel={ownProfile ? 'My profile' : 'Student portfolio'} />
      <main className="profile-page">
        {loading ? (
          <div className="profile-loading">
            <RefreshCw className="spin-icon" size={25} />
            <p>Loading student profile...</p>
          </div>
        ) : error ? (
          <div className="profile-loading">
            <h1>Profile unavailable</h1>
            <p>{error}</p>
            <button type="button" className="session-save-button" onClick={handleBack}>
              {getBackLabel()}
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="back-to-jobs"
              onClick={handleBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}
            >
              <ArrowLeft size={16} /> {getBackLabel()}
            </button>

            <section className="profile-hero">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-hero-copy">
                <p className="small-heading">STUDENT PORTFOLIO</p>
                <h1>{studentName}</h1>
                <p>
                  <GraduationCap size={16} />{' '}
                  {profile.course?.trim() ? profile.course : 'Course: Not provided'} ·{' '}
                  {profile.college?.trim() ? profile.college : 'College: Not provided'}
                </p>
                <span>
                  <MapPin size={14} />{' '}
                  {profile.availability?.trim()
                    ? `Available ${profile.availability.toLowerCase()}`
                    : 'Availability: Not provided'}
                </span>
              </div>
              {ownProfile && (
                <Link
                  className="profile-settings-link"
                  to="/portfolio/edit"
                  state={{
                    from: location.state?.from || (location.pathname + location.search),
                    fromName: location.state?.fromName,
                    activePage: location.state?.activePage,
                  }}
                >
                  Edit portfolio
                </Link>
              )}
            </section>

            <section className="profile-grid">
              <div className="profile-main">
                <article className="profile-card">
                  <p className="small-heading">ABOUT ME</p>
                  <h2>Building practical digital experiences.</h2>
                  {profile.bio?.trim() && profile.bio.trim() !== 'This student has not added a bio yet.' ? (
                    <p className="profile-bio">{profile.bio}</p>
                  ) : (
                    <p className="profile-bio" style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                      Not provided
                    </p>
                  )}
                </article>

                <article className="profile-card">
                  <div className="profile-card-title">
                    <div>
                      <p className="small-heading">PROJECTS</p>
                      <h2>Selected work</h2>
                    </div>
                    <FolderKanban size={21} />
                  </div>
                  {profile.projects && profile.projects.length > 0 ? (
                    <div className="project-list">
                      {profile.projects.map((project) => (
                        <article className="portfolio-project" key={project.title}>
                          <span className="project-mark">↗</span>
                          <div>
                            <h3>{project.title}</h3>
                            <p className="project-stack">{project.stack}</p>
                            <p>{project.description}</p>
                            {(project.repoUrl || project.liveUrl) && (
                              <div className="project-links">
                                {project.repoUrl && (
                                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                                    <GitFork size={13} /> Repository
                                  </a>
                                )}
                                {project.liveUrl && (
                                  <a href={project.liveUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink size={13} /> Live site
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="portfolio-newbie-state">
                      <FolderKanban size={22} />
                      <h3>Projects</h3>
                      <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>Not provided</p>
                      {ownProfile && (
                        <Link
                          to="/portfolio/edit"
                          state={{
                            from: location.state?.from || (location.pathname + location.search),
                            fromName: location.state?.fromName,
                            activePage: location.state?.activePage,
                          }}
                        >
                          Add a project
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              </div>

              <aside className="profile-side">
                <article className="profile-card">
                  <p className="small-heading">SKILLS</p>
                  <h2>Tools I work with</h2>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="profile-skills">
                      {profile.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="portfolio-newbie-state skills-empty">
                      <Sparkles size={19} />
                      <p style={{ color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>Not provided</p>
                      {ownProfile && (
                        <Link
                          to="/portfolio/edit"
                          state={{
                            from: location.state?.from || (location.pathname + location.search),
                            fromName: location.state?.fromName,
                            activePage: location.state?.activePage,
                          }}
                        >
                          Add skills
                        </Link>
                      )}
                    </div>
                  )}
                </article>

                <article className="profile-card resume-card">
                  <Download size={21} />
                  <div>
                    <p className="small-heading">RESUME</p>
                    <h2>{profile.resumeFile ? (profile.resumeLabel || 'Resume uploaded') : 'Not provided'}</h2>
                    <button
                      type="button"
                      className="resume-download-button"
                      onClick={downloadResume}
                      disabled={!profile.resumeFile}
                      style={!profile.resumeFile ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                    >
                      <Link2 size={14} /> {profile.resumeFile ? 'Download resume' : 'Not provided'}
                    </button>
                  </div>
                </article>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
