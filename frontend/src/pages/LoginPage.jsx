import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Home, Briefcase, Eye, EyeOff, ArrowRight, UserCheck, GraduationCap, Users, KeyRound, X } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Forgot Password State
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotRole, setForgotRole] = useState('Student');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleFillDemo = (demoRole, demoEmail, demoPass, demoCompany = '') => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setCompany(demoCompany);
    setMessage('');
    setIsError(false);
    setDemoOpen(false);
  };

  const handleOpenForgot = (e) => {
    e?.preventDefault();
    setForgotRole(role);
    setForgotEmail(email);
    setNewPass('');
    setConfirmNewPass('');
    setForgotMessage('');
    setForgotError(false);
    setForgotOpen(true);
  };

  const handleCloseForgot = () => {
    setForgotOpen(false);
    setForgotMessage('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError(false);

    if (!forgotEmail.trim() || !newPass || !confirmNewPass) {
      setForgotError(true);
      setForgotMessage('Please enter your registered email and new password.');
      return;
    }

    if (!isValidEmail(forgotEmail)) {
      setForgotError(true);
      setForgotMessage('Email must contain @ and a dot after it.');
      return;
    }

    if (newPass.length < 6) {
      setForgotError(true);
      setForgotMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setForgotError(true);
      setForgotMessage('New passwords do not match. Please re-type carefully.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.changePassword({
        email: forgotEmail.trim(),
        role: forgotRole,
        newPassword: newPass,
        confirmPassword: confirmNewPass,
      });

      setForgotError(false);
      setForgotMessage(res.message || 'Password reset successfully!');
      setEmail(forgotEmail.trim());
      setRole(forgotRole);
      setPassword('');

      setTimeout(() => {
        setForgotOpen(false);
        setMessage('Password reset successfully! Please sign in with your new password.');
        setIsError(false);
      }, 1500);
    } catch (err) {
      setForgotError(true);
      setForgotMessage(err.message || 'Could not reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || !password || (role === 'Recruiter' && !company.trim())) {
      setIsError(true);
      setMessage('Please enter all required login details.');
      return;
    }

    if (!isValidEmail(email)) {
      setIsError(true);
      setMessage('Email must contain @ and a dot after it.');
      return;
    }

    setLoading(true);
    try {
      const account = await api.login({
        email: email.trim(),
        password,
        role,
        company: company.trim(),
      });

      login(account);
      setIsError(false);
      setMessage(`Welcome back, ${account.name}!`);

      setTimeout(() => {
        navigate(role === 'Recruiter' ? '/recruiter' : '/student');
      }, 500);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="auth-controls">
        <div className="demo-menu">
          <button type="button" className="demo-menu-trigger" onClick={() => setDemoOpen((open) => !open)} aria-expanded={demoOpen} aria-controls="demo-accounts">
            <Users size={15} /> Demo accounts
          </button>
          {demoOpen && <div id="demo-accounts" className="demo-menu-panel">
            <button type="button" onClick={() => handleFillDemo('Student', 'rahul@example.com', 'password123')}><GraduationCap size={14} /><span>Rahul<span>Student</span></span></button>
            <button type="button" onClick={() => handleFillDemo('Recruiter', 'gurpreet@tech.example', 'password123', 'Spy Tech')}><Briefcase size={14} /><span>Spy Tech<span>Recruiter</span></span></button>
          </div>}
        </div>
      </div>

      {/* Left Welcome Panel */}
      <section className="welcome-panel">
        <Link className="brand" to="/" aria-label="Go to Kairos landing page" onClick={(event) => { event.preventDefault(); window.location.hash = '/'; }}>
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos" className="brand-logo-img" />
          <span>Kairos<span className="brand-dot">.</span></span>
        </Link>

        <div className="welcome-copy">
          <p className="eyebrow">THE RIGHT MOMENT FOR WORK</p>
          <h1>
            Work that fits
            <br />
            around your life.
          </h1>
          <p className="intro">
            <strong>Kairos</strong> means the right moment. We connect students who need flexible work with trusted local employers looking for capable people.
          </p>
        </div>

        <div className="connection-card">
          <p className="connection-label">HOW KAIROS WORKS</p>
          <div className="connection-flow">
            <span>
              <b>1</b>Create your profile
            </span>
            <i>→</i>
            <span>
              <b>2</b>Find the right match
            </span>
            <i>→</i>
            <span>
              <b>3</b>Start with confidence
            </span>
          </div>
          <p className="trust-note">
            <span><UserCheck size={14} /></span> Built for students and verified employers
          </p>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="form-panel">
        <div className="form-box">
          <p className="small-heading">WELCOME BACK</p>
          <h2>Sign in to Kairos</h2>
          <p className="form-intro">Choose how you want to use Kairos.</p>

          <div className="role-options" role="group" aria-label="Choose account type">
            <button
              className={`role-card ${role === 'Student' ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setRole('Student');
                setMessage('');
              }}
              aria-pressed={role === 'Student'}
            >
              <span className="role-icon">
                <Home size={16} />
              </span>
              <span>
                <strong>I'm a student</strong>
                <small>Find part-time opportunities</small>
              </span>
            </button>

            <button
              className={`role-card ${role === 'Recruiter' ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setRole('Recruiter');
                setMessage('');
              }}
              aria-pressed={role === 'Recruiter'}
            >
              <span className="role-icon">
                <Briefcase size={16} />
              </span>
              <span>
                <strong>I'm a recruiter</strong>
                <small>Hire talented students</small>
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {role === 'Recruiter' && (
              <div id="companyField">
                <label htmlFor="loginCompany">Company name</label>
                <input
                  id="loginCompany"
                  type="text"
                  placeholder="Enter your company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="password-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleOpenForgot}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  fontSize: '13px',
                  color: 'var(--green)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                id="showPassword"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button className="sign-in-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>

            {message && (
              <p className={`message ${isError ? 'error-message' : ''}`} aria-live="polite">
                {message}
              </p>
            )}
          </form>

          <p className="signup-text">
            New to Kairos? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>

      {/* Forgot / Reset Password Modal */}
      {forgotOpen && (
        <div className="chat-modal-backdrop" onClick={handleCloseForgot} style={{ zIndex: 1000, display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div
            className="forgot-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '32px clamp(20px, 4vw, 36px)',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
              position: 'relative',
              animation: 'fadeUp 0.25s ease-out'
            }}
          >
            <button
              type="button"
              onClick={handleCloseForgot}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center'
              }}
              title="Close"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--light-green)',
                color: 'var(--green)',
                display: 'grid',
                placeItems: 'center'
              }}>
                <KeyRound size={18} />
              </span>
              <div>
                <p className="small-heading" style={{ margin: 0, fontSize: '10px' }}>ACCOUNT SECURITY</p>
                <h3 style={{ margin: 0, fontSize: '20px', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 }}>Reset Password</h3>
              </div>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 18px', lineHeight: 1.5 }}>
              Enter your registered email address to set and confirm your new password.
            </p>

            <form onSubmit={handleForgotSubmit} noValidate>
              <div className="role-options" style={{ marginBottom: '16px', gridTemplateColumns: '1fr 1fr' }} role="group" aria-label="Account type">
                <button
                  type="button"
                  className={`role-card ${forgotRole === 'Student' ? 'selected' : ''}`}
                  onClick={() => { setForgotRole('Student'); setForgotMessage(''); }}
                  style={{ padding: '8px 12px' }}
                >
                  <Home size={14} /> <strong>Student</strong>
                </button>
                <button
                  type="button"
                  className={`role-card ${forgotRole === 'Recruiter' ? 'selected' : ''}`}
                  onClick={() => { setForgotRole('Recruiter'); setForgotMessage(''); }}
                  style={{ padding: '8px 12px' }}
                >
                  <Briefcase size={14} /> <strong>Recruiter</strong>
                </button>
              </div>

              <label htmlFor="forgotEmail">Registered Email</label>
              <input
                id="forgotEmail"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />

              <label htmlFor="newPass">New Password</label>
              <div className="password-input">
                <input
                  id="newPass"
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? 'Hide' : 'Show'}
                </button>
              </div>

              <label htmlFor="confirmNewPass">Confirm New Password</label>
              <div className="password-input">
                <input
                  id="confirmNewPass"
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? 'Hide' : 'Show'}
                </button>
              </div>

              <button className="sign-in-button" type="submit" disabled={forgotLoading} style={{ marginTop: '16px' }}>
                {forgotLoading ? 'Updating password...' : 'Update password'}
              </button>

              {forgotMessage && (
                <p className={`message ${forgotError ? 'error-message' : ''}`} style={{ marginTop: '12px' }} aria-live="polite">
                  {forgotMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
