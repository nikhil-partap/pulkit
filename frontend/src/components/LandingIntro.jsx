import React, { useEffect, useRef, useState } from 'react';

const INTRO_KEY = 'kairos_intro_played';
const PLAY_MS = 3100;
const EXIT_MS = 1000;
const TICKS = Array.from({ length: 12 }, (_, i) => i);

// The intro plays once per browser session and never for reduced-motion users.
export function shouldPlayIntro() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(INTRO_KEY) !== '1';
  } catch {
    return false;
  }
}

// Full-screen opening sequence: a clock dial sweeps to "the right moment",
// the Kairos mark and wordmark rise in, then the screen splits open.
export default function LandingIntro({ onReveal, onDone }) {
  const [exiting, setExiting] = useState(false);
  const callbacks = useRef({ onReveal, onDone });
  const timers = useRef([]);
  const exitRef = useRef(() => {});

  useEffect(() => {
    callbacks.current = { onReveal, onDone };
  });

  useEffect(() => {
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch { /* storage unavailable */ }

    let exited = false;
    const exit = () => {
      if (exited) return;
      exited = true;
      timers.current.forEach(clearTimeout);
      setExiting(true);
      callbacks.current.onReveal();
      timers.current = [setTimeout(() => callbacks.current.onDone(), EXIT_MS)];
    };
    exitRef.current = exit;

    timers.current.push(setTimeout(exit, PLAY_MS));
    window.addEventListener('keydown', exit);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('keydown', exit);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const skip = () => exitRef.current();

  return (
    <div className={`kairos-intro${exiting ? ' is-exiting' : ''}`} onClick={skip}>
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />
      <span className="intro-seam" />

      <div className="intro-stage" aria-hidden="true">
        <div className="intro-dial">
          <svg viewBox="0 0 200 200">
            <circle className="intro-dial-ring" cx="100" cy="100" r="88" />
            {TICKS.map((i) => (
              <line
                key={i}
                className={`intro-dial-tick${i === 0 ? ' is-noon' : ''}`}
                x1="100" y1="18" x2="100" y2={i % 3 === 0 ? 30 : 25}
                transform={`rotate(${i * 30} 100 100)`}
                style={{ '--i': i }}
              />
            ))}
            <line className="intro-dial-hand" x1="100" y1="100" x2="100" y2="34" />
            <circle className="intro-dial-pin" cx="100" cy="100" r="4" />
          </svg>
          <span className="intro-burst" />
          <span className="intro-burst intro-burst-late" />
          <img className="intro-logo" src={`${import.meta.env.BASE_URL}favicon.png`} alt="" />
        </div>

        <p className="intro-word">
          {'kairos'.split('').map((letter, i) => (
            <span key={i} style={{ '--i': i }}>{letter}</span>
          ))}
          <span className="intro-word-dot" style={{ '--i': 6 }}>.</span>
        </p>
        <p className="intro-tagline">The right moment to learn, work and hire.</p>
        <span className="intro-progress" />
      </div>

      <button type="button" className="intro-skip" onClick={(event) => { event.stopPropagation(); skip(); }}>
        Skip intro
      </button>
    </div>
  );
}
