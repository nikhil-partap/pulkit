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

  const fromSkills = location.state?.from === 'skills';

  const handleBack = (e) => {
    e.preventDefault();
    if (fromSkills) {
      navigate('/student?tab=skills', { state: { activePage: 'skills' } });
    } else if (user?.role === 'Student') {
      navigate('/student', { state: { activePage: 'jobs' } });
    } else {
      navigate('/recruiter');
    }
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

  return <div className="dashboard-screen"><Navbar workspaceLabel={ownProfile ? 'My profile' : 'Student portfolio'} /><main className="profile-page">{loading ? <div className="profile-loading"><RefreshCw className="spin-icon" size={25} /><p>Loading student profile...</p></div> : error ? <div className="profile-loading"><h1>Profile unavailable</h1><p>{error}</p><button type="button" className="session-save-button" onClick={handleBack}>Back to workspace</button></div> : <><button type="button" className="back-to-jobs" onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', padding: 0 }}><ArrowLeft size={16} /> {fromSkills ? 'Back to Skill Exchange' : user?.role === 'Student' ? 'Back to opportunities' : 'Back to candidates'}</button><section className="profile-hero"><div className="profile-avatar">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="profile-hero-copy"><p className="small-heading">STUDENT PORTFOLIO</p><h1>{profile.name}</h1><p><GraduationCap size={16} /> {profile.course} · {profile.college}</p><span><MapPin size={14} /> Available {profile.availability?.toLowerCase()}</span></div>{ownProfile && <Link className="profile-settings-link" to="/portfolio/edit">Edit portfolio</Link>}</section><section className="profile-grid"><div className="profile-main"><article className="profile-card"><p className="small-heading">ABOUT ME</p><h2>Building practical digital experiences.</h2><p className="profile-bio">{profile.bio}</p></article><article className="profile-card"><div className="profile-card-title"><div><p className="small-heading">PROJECTS</p><h2>Selected work</h2></div><FolderKanban size={21} /></div>{profile.projects.length ? <div className="project-list">{profile.projects.map((project) => <article className="portfolio-project" key={project.title}><span className="project-mark">↗</span><div><h3>{project.title}</h3><p className="project-stack">{project.stack}</p><p>{project.description}</p>{(project.repoUrl || project.liveUrl) && <div className="project-links">{project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer"><GitFork size={13} /> Repository</a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Live site</a>}</div>}</div></article>)}</div> : <div className="portfolio-newbie-state"><FolderKanban size={22} /><h3>No projects yet</h3><p>{ownProfile ? 'Start with a small project when you are ready—practice work counts too.' : 'This student has not added projects yet.'}</p>{ownProfile && <Link to="/portfolio/edit">Add a project</Link>}</div>}</article></div><aside className="profile-side"><article className="profile-card"><p className="small-heading">SKILLS</p><h2>Tools I work with</h2>{profile.skills.length ? <div className="profile-skills">{profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <div className="portfolio-newbie-state skills-empty"><Sparkles size={19} /><p>{ownProfile ? 'No skills added yet. Start with skills you are currently learning.' : 'No skills listed yet.'}</p>{ownProfile && <Link to="/portfolio/edit">Add skills</Link>}</div>}</article><article className="profile-card resume-card"><Download size={21} /><div><p className="small-heading">RESUME</p><h2>{profile.resumeLabel}</h2><button type="button" className="resume-download-button" onClick={downloadResume} disabled={!profile.resumeFile}><Link2 size={14} /> {profile.resumeFile ? 'Download resume' : 'Upload resume to download'}</button></div></article></aside></section></>}</main></div>;
}
