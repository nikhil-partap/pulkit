import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { isStrongPassword, PASSWORD_REQUIREMENT_MESSAGE } from '../services/passwordRules';
import PasswordChecklist from '../components/PasswordChecklist';
import { COLLEGE_SUGGESTIONS, COURSE_SUGGESTIONS } from '../services/academicOptions';
import { Home, Briefcase, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('Student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Student specific
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [availability, setAvailability] = useState('');

  // Recruiter specific
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!fullName || !email || !password) {
      setIsError(true);
      setMessage('Please complete all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      setIsError(true);
      setMessage('Email must contain @ and a dot after it.');
      return;
    }

    if (!isStrongPassword(password)) {
      setIsError(true);
      setMessage(PASSWORD_REQUIREMENT_MESSAGE);
      return;
    }

    if (!termsAgreed) {
      setIsError(true);
      setMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    if (role === 'Student' && (!college || !course || !availability)) {
      setIsError(true);
      setMessage('Please complete your student profile fields.');
      return;
    }

    if (role === 'Recruiter' && (!company || !jobTitle || !industry)) {
      setIsError(true);
      setMessage('Please complete your company profile fields.');
      return;
    }

    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      college: college.trim(),
      course: course.trim(),
      availability,
      company: company.trim(),
      jobTitle: jobTitle.trim(),
      industry,
    };

    setLoading(true);
    try {
      const account = await api.register(payload);
      login(account);
      setIsError(false);
      setMessage('Account created! Opening your workspace...');

      setTimeout(() => {
        navigate(role === 'Recruiter' ? '/recruiter' : '/student');
      }, 700);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page register-page">

      {/* Left Welcome Panel */}
      <section className="welcome-panel">
        <Link className="brand" to="/login">
          <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Kairos" className="brand-logo-img" />
          <span>Kairos<span className="brand-dot">.</span></span>
        </Link>

        <div className="welcome-copy">
          <p className="eyebrow">THE RIGHT MOMENT FOR WORK</p>
          <h1>
            More than a job.
            <br />
            A better fit.
          </h1>
          <p className="intro">
            <strong>Kairos</strong> means the right moment. We make it easier for students to build experience and for employers to find reliable, motivated talent.
          </p>
        </div>

        <div className="connection-card">
          <p className="connection-label">ONE PLACE. THE RIGHT CONNECTION.</p>
          <div className="connection-flow">
            <span>
              <b>1</b>Share what you need
            </span>
            <i>→</i>
            <span>
              <b>2</b>Meet your match
            </span>
            <i>→</i>
            <span>
              <b>3</b>Make it happen
            </span>
          </div>
          <p className="trust-note">
            <span><Check size={14} /></span> Flexible opportunities, meaningful growth
          </p>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="form-panel register-form-panel">
        <div className="form-box">
          <p className="small-heading">GET STARTED</p>
          <h2>Create your account</h2>
          <p className="form-intro">Tell us a little about yourself.</p>

          <div className="role-options" role="group" aria-label="Choose account type">
            <button
              className={`role-card ${role === 'Student' ? 'selected' : ''}`}
              type="button"
              onClick={() => setRole('Student')}
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
              onClick={() => setRole('Recruiter')}
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
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <label htmlFor="registerEmail">Email address</label>
            <input
              id="registerEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Student Specific Fields */}
            {role === 'Student' && (
              <div id="studentFields" className="role-fields">
                <label htmlFor="college">College or university</label>
                <input
                  id="college"
                  name="college"
                  type="text"
                  list="collegeSuggestions"
                  autoComplete="on"
                  placeholder="Example: Delhi University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                />
                <datalist id="collegeSuggestions">
                  {COLLEGE_SUGGESTIONS.map((option) => <option key={option} value={option} />)}
                </datalist>

                <div className="two-fields">
                  <div>
                    <label htmlFor="course">Course / degree</label>
                    <input
                      id="course"
                      name="course"
                      type="text"
                      list="courseSuggestions"
                      autoComplete="on"
                      placeholder="Example: BCA"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                    <datalist id="courseSuggestions">
                      {COURSE_SUGGESTIONS.map((option) => <option key={option} value={option} />)}
                    </datalist>
                  </div>
                  <div>
                    <label htmlFor="availability">Availability</label>
                    <select
                      id="availability"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Choose
                      </option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Recruiter Specific Fields */}
            {role === 'Recruiter' && (
              <div id="recruiterFields" className="role-fields">
                <label htmlFor="company">Company name</label>
                <input
                  id="company"
                  type="text"
                  placeholder="Example: Bright Café"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />

                <div className="two-fields">
                  <div>
                    <label htmlFor="jobTitle">Your job title</label>
                    <input
                      id="jobTitle"
                      type="text"
                      placeholder="Example: Manager"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="industry">Industry</label>
                    <select
                      id="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Choose
                      </option>
                      <option value="Food & hospitality">Food & hospitality</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <label htmlFor="registerPassword">Create password</label>
            <div className="password-input">
              <input
                id="registerPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                aria-describedby="registerPasswordRules"
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
            <PasswordChecklist password={password} id="registerPasswordRules" />

            <label className="checkbox-label" htmlFor="terms">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                required
              />
              <span>
                I agree to the <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
              </span>
            </label>

            <button className="sign-in-button" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}{' '}
              <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>

            {message && (
              <p className={`message ${isError ? 'error-message' : ''}`} aria-live="polite">
                {message}
              </p>
            )}
          </form>

          <p className="signup-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
