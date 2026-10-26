import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

const COUNTDOWN_MS = 1200;
const NUDGE_MS = 220;
const LEAVE_MS = 180;
const RING_RADIUS = 30;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const isTypingTarget = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// Ctrl + B shows a short, cancellable "signing you out" countdown before calling onConfirm.
export default function SignOutOverlay({ name, onConfirm }) {
  const [phase, setPhase] = useState('idle'); // idle | counting | done | leaving
  const timers = useRef([]);
  const onConfirmRef = useRef(onConfirm);
  const phaseRef = useRef(phase);

  useEffect(() => {
    onConfirmRef.current = onConfirm;
    phaseRef.current = phase;
  });

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const start = () => {
    clearTimers();
    setPhase('counting');
    timers.current.push(setTimeout(() => {
      setPhase('done');
      timers.current.push(setTimeout(() => onConfirmRef.current(), NUDGE_MS));
    }, COUNTDOWN_MS));
  };

  const cancel = () => {
    clearTimers();
    setPhase('leaving');
    timers.current.push(setTimeout(() => setPhase('idle'), LEAVE_MS));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const current = phaseRef.current;
      const isShortcut = event.ctrlKey && event.key.toLowerCase() === 'b';

      if (current === 'counting') {
        if (isShortcut || event.key === 'Escape') {
          event.preventDefault();
          cancel();
        }
        return;
      }

      if (isShortcut && current === 'idle' && !isTypingTarget(event.target)) {
        event.preventDefault();
        start();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimers();
    };
  }, []);

  // Soften the page behind the card while the countdown runs.
  useEffect(() => {
    const root = document.getElementById('root');
    const active = phase === 'counting' || phase === 'done';
    if (root && active) {
      root.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
    }
    document.body.classList.toggle('is-signing-out', active);
    return () => document.body.classList.remove('is-signing-out');
  }, [phase]);

  if (phase === 'idle') return null;

  const firstName = (name || '').trim().split(/\s+/)[0];

  return createPortal(
    <div
      className={`signout-backdrop signout-${phase}`}
      onClick={() => phase === 'counting' && cancel()}
      role="alertdialog"
      aria-live="assertive"
      aria-label="Signing out"
    >
      <div className="signout-card">
        <div className="signout-ring">
          <svg viewBox="0 0 72 72" aria-hidden="true">
            <circle className="signout-ring-track" cx="36" cy="36" r={RING_RADIUS} />
            <circle
              className="signout-ring-fill"
              cx="36"
              cy="36"
              r={RING_RADIUS}
              style={{ strokeDasharray: RING_LENGTH, '--ring-length': RING_LENGTH, '--countdown': `${COUNTDOWN_MS}ms` }}
            />
          </svg>
          <span className="signout-icon"><LogOut size={22} /></span>
        </div>
        <p className="signout-title">Signing you out{firstName ? `, ${firstName}` : ''}…</p>
        <p className="signout-hint">Press <kbd>Esc</kbd> or click anywhere to cancel</p>
      </div>
    </div>,
    document.body,
  );
}
