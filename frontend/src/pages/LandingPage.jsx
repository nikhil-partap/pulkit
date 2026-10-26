import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Check, Compass, GraduationCap, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingIntro, { shouldPlayIntro } from '../components/LandingIntro';
import LandingPreview from '../components/LandingPreview';

export default function LandingPage() {
  const scrollToSection = useCallback((event, id) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const pageRef = useRef(null);
  const [intro, setIntro] = useState(() => (shouldPlayIntro() ? 'playing' : 'done')); // playing | revealing | done

  // Reveal each section once as it scrolls into view.
  useEffect(() => {
    const sections = pageRef.current?.querySelectorAll('[data-reveal]') || [];
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <main className={`landing-page${intro === 'playing' ? ' intro-playing' : ''}`} ref={pageRef}>
    {intro !== 'done' && <LandingIntro onReveal={() => setIntro('revealing')} onDone={() => setIntro('done')} />}
    <nav className="landing-nav landing-enter-nav"><Link to="/" className="landing-brand"><img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos logo" className="landing-logo-image" />kairos<span>.</span></Link><div className="landing-nav-links"><a href="#how-it-works" onClick={(event) => scrollToSection(event, 'how-it-works')}>How it works</a><a href="#for-everyone" onClick={(event) => scrollToSection(event, 'for-everyone')}>For everyone</a></div><div className="landing-nav-actions"><Link to="/login" className="landing-login">Sign in</Link><Link to="/register" className="landing-nav-cta">Get started <ArrowRight size={15} /></Link></div></nav>
    <section className="landing-hero"><div className="landing-grid-lines" /><div className="landing-hero-copy landing-enter-copy"><p className="landing-eyebrow">THE STUDENT OPPORTUNITY NETWORK</p><h1>Learn together.<br /><em>Work</em> with purpose.</h1><p>Kairos brings flexible student jobs, recruiter hiring, and peer-to-peer skill exchange into one place — so the right next step is never hard to find.</p><div className="landing-hero-actions"><Link to="/register" className="landing-primary-cta">Create your account <ArrowRight size={17} /></Link><a href="#how-it-works" className="landing-secondary-cta" onClick={(event) => scrollToSection(event, 'how-it-works')}>See how it works</a></div><div className="landing-trust-row"><span><BadgeCheck size={16} /> Built for students</span><span><BadgeCheck size={16} /> Verified employers</span><span><BadgeCheck size={16} /> Peer learning</span></div></div>
      <LandingPreview play={intro !== 'playing'} /></section>
    <section id="for-everyone" className="landing-pillars" data-reveal><div className="landing-section-intro reveal-item"><p className="landing-eyebrow">ONE PLACE, THREE PATHS</p><h2>Built around the way students grow.</h2><p>Whether you are looking for a role, teaching something you know, or hiring early talent, Kairos keeps the path simple.</p></div><div className="landing-pillar-grid"><Pillar index={1} type="student" icon={<GraduationCap size={23} />} kicker="FOR STUDENTS" title="Find work that fits your life." text="Search real openings, save a role, and track every application from one dashboard." cta="Find opportunities" /><Pillar index={2} type="exchange" icon={<BookOpen size={23} />} kicker="SKILL EXCHANGE" title="Turn what you know into a session." text="Book focused peer sessions or create one yourself — from React basics to portfolio design." cta="Explore sessions" /><Pillar index={3} type="recruiter" icon={<BriefcaseBusiness size={23} />} kicker="FOR RECRUITERS" title="Meet students ready to contribute." text="Post a flexible role, review applicant portfolios, and keep your hiring organised." cta="Hire student talent" /></div></section>
    <section id="how-it-works" className="landing-flow-section" data-reveal><div className="landing-section-intro reveal-item"><p className="landing-eyebrow">HOW KAIROS WORKS</p><h2>From intention to action in three steps.</h2></div><div className="landing-flow"><Flow index={1} number="01" icon={<UsersRound size={21} />} title="Create your space" text="Choose Student or Recruiter and set up a profile that makes your goal clear." /><i style={{ '--i': 2 }} /><Flow index={2} number="02" icon={<Compass size={21} />} title="Explore your match" text="Discover job openings and practical learning sessions through one focused Explore page." /><i style={{ '--i': 3 }} /><Flow index={3} number="03" icon={<Check size={21} />} title="Make progress" text="Apply, book, teach, hire, and stay up to date with clear notifications." /></div></section>
    <section className="landing-final-cta" data-reveal><div className="reveal-item"><p className="landing-eyebrow">YOUR RIGHT MOMENT</p><h2>Make your next step count.</h2><p>Join Kairos and build experience, share skills, or find capable student talent.</p></div><Link to="/register" className="landing-primary-cta light reveal-item" style={{ '--i': 1 }}>Start with Kairos <ArrowRight size={17} /></Link></section><footer className="landing-footer"><span className="landing-brand"><img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" className="landing-logo-image" />kairos<span>.</span></span><p>Opportunity, learning, and talent — connected.</p><Link to="/login">Already have an account? Sign in</Link></footer>
  </main>;
}

function Pillar({ index, type, icon, kicker, title, text, cta }) { return <article className={`landing-pillar ${type} reveal-item`} style={{ '--i': index }}><span className="pillar-icon">{icon}</span><p>{kicker}</p><h3>{title}</h3><span>{text}</span><Link to="/register">{cta} <ArrowRight size={15} /></Link></article>; }
function Flow({ index, number, icon, title, text }) { return <article className="reveal-item" style={{ '--i': index }}><b>{number}</b><span className="flow-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>; }
