import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, BriefcaseBusiness, Check, Compass, LayoutDashboard, Search, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEARCH_TEXT = 'Frontend developer';
const NAV_ITEMS = [
  { label: 'Explore', icon: Compass },
  { label: 'Jobs', icon: BriefcaseBusiness },
  { label: 'Skills', icon: BookOpen },
  { label: 'Applications', icon: LayoutDashboard },
];
const IDLE = { typed: '', nav: 0, hover: null, applied: false, booked: false, toast: null, badge: false };

class Cancelled extends Error {}

// Position of `el` inside `container`, ignoring the preview's tilt transform.
function offsetWithin(el, container) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== container) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

// The hero's product preview, which plays a looping walkthrough once `play` is true:
// search for a role, apply to it, then book a skill session.
export default function LandingPreview({ play }) {
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const jobActionRef = useRef(null);
  const sessionActionRef = useRef(null);
  const [demo, setDemo] = useState(IDLE);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false, clicks: 0, pressed: false });

  useEffect(() => {
    if (!play || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    const timers = new Set();
    const wait = (ms) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (cancelled) reject(new Cancelled());
        else resolve();
      }, ms);
      timers.add(timer);
    });
    const update = (patch) => setDemo((current) => ({ ...current, ...patch }));
    const moveTo = async (el, fx = 0.5, fy = 0.5) => {
      const container = containerRef.current;
      if (!el || !container) throw new Cancelled();
      const box = offsetWithin(el, container);
      setCursor((current) => ({ ...current, visible: true, x: box.x + box.w * fx, y: box.y + box.h * fy }));
      await wait(750);
    };
    const click = async () => {
      setCursor((current) => ({ ...current, pressed: true, clicks: current.clicks + 1 }));
      await wait(160);
      setCursor((current) => ({ ...current, pressed: false }));
    };

    const run = async () => {
      await wait(900);
      while (!cancelled) {
        const container = containerRef.current;
        setDemo(IDLE);
        setCursor((current) => ({ ...current, visible: false, x: container.offsetWidth * 0.92, y: container.offsetHeight * 1.05 }));
        await wait(500);

        await moveTo(searchRef.current, 0.3, 0.5);
        await click();
        for (let i = 1; i <= SEARCH_TEXT.length; i += 1) {
          update({ typed: SEARCH_TEXT.slice(0, i) });
          await wait(55);
        }
        await wait(300);
        update({ nav: 1 });

        update({ hover: 'job' });
        await moveTo(jobActionRef.current, 0.45, 0.6);
        await click();
        update({ applied: true, toast: { title: 'Application sent', detail: 'Frontend Developer · Spy Tech' } });
        await wait(1700);
        update({ toast: null, hover: null });
        await wait(300);

        update({ nav: 2, hover: 'session' });
        await moveTo(sessionActionRef.current, 0.45, 0.6);
        await click();
        update({ booked: true, badge: true, toast: { title: 'Seat booked', detail: 'React hooks, practical · Wed 5 PM' } });
        await wait(1700);
        update({ toast: null, hover: null });

        setCursor((current) => ({ ...current, visible: false }));
        await wait(1800);
      }
    };

    run().catch((error) => {
      if (!(error instanceof Cancelled)) throw error;
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [play]);

  const typing = demo.typed.length > 0;

  return (
    <div className="landing-product-preview landing-enter-preview" ref={containerRef} aria-label="A preview of the Kairos workspace">
      <div className="preview-topbar">
        <span className="preview-logo">k<span>.</span></span>
        <div />
        <span>Rahul Sharma</span>
        <i>{demo.badge && <b className="preview-badge">1</b>}</i>
      </div>
      <div className="preview-body">
        <aside>
          {NAV_ITEMS.map(({ label, icon: Icon }, index) => (
            <span key={label} className={demo.nav === index ? 'preview-nav-active' : ''}><Icon size={14} /> {label}</span>
          ))}
        </aside>
        <section>
          <p>YOUR NEXT MOVE STARTS HERE</p>
          <h2>Explore what moves you forward.</h2>
          <Link to="/register" className={`preview-search${typing ? ' is-typing' : ''}`} ref={searchRef}>
            <Search size={14} />
            {typing ? <span className="preview-typed">{demo.typed}<i /></span> : 'Start exploring roles and skills'}
          </Link>
          <div className="preview-mini-cards">
            <PreviewCard
              icon={<BriefcaseBusiness size={11} />}
              type="JOB"
              title="Frontend Developer"
              detail="Spy Tech · Hybrid"
              action="View details"
              doneAction="Applied"
              done={demo.applied}
              active={demo.hover === 'job'}
              dimmed={demo.hover === 'session'}
              actionRef={jobActionRef}
            />
            <PreviewCard
              icon={<UsersRound size={11} />}
              type="SESSION"
              title="React hooks, practical"
              detail="with Rahul · 60 min"
              action="Book seat"
              doneAction="Booked"
              done={demo.booked}
              active={demo.hover === 'session'}
              dimmed={demo.hover === 'job'}
              actionRef={sessionActionRef}
            />
          </div>
        </section>
      </div>

      <div className={`preview-toast${demo.toast ? ' is-visible' : ''}`} role="status">
        <span><Check size={12} /></span>
        <p><strong>{demo.toast?.title}</strong><small>{demo.toast?.detail}</small></p>
      </div>

      <span
        className={`preview-cursor${cursor.visible ? ' is-visible' : ''}${cursor.pressed ? ' is-pressed' : ''}`}
        style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24"><path d="M5 3l14 8.5-6.2 1.3L9.5 19z" /></svg>
        <i key={cursor.clicks} className={cursor.clicks ? 'preview-click-ripple' : ''} />
      </span>
    </div>
  );
}

function PreviewCard({ icon, type, title, detail, action, doneAction, done, active, dimmed, actionRef }) {
  const className = ['preview-card-link', active && 'is-active', dimmed && 'is-dimmed', done && 'is-done'].filter(Boolean).join(' ');
  return (
    <Link to="/register" className={className}>
      <article>
        <small>{icon} {type}</small>
        <strong>{title}</strong>
        <span>{detail}</span>
        <b ref={actionRef}>{done ? <><Check size={12} /> {doneAction}</> : <>{action} <ArrowRight size={12} /></>}</b>
      </article>
    </Link>
  );
}
