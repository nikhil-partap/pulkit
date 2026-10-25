// In-Memory Mock Service for Kairos (State-driven for React evaluations)

const INITIAL_STUDENTS = [
  { id: 1, full_name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'BCA', availability: 'Weekdays', bio: 'Frontend-focused BCA student who enjoys turning ideas into useful, accessible interfaces. Currently building experience through part-time roles and peer learning.', skills: ['React', 'JavaScript', 'CSS', 'Figma', 'Git'], resume_label: 'Rahul_Sharma_Resume.pdf', projects: [{ title: 'Campus event finder', stack: 'React · REST API', description: 'A responsive student event discovery app with search and category filters.', repoUrl: 'https://github.com/', liveUrl: '' }, { title: 'Cafe ordering interface', stack: 'HTML · CSS · JavaScript', description: 'A mobile-first ordering flow designed for quick counter pickups.', repoUrl: '', liveUrl: '' }] },
  { id: 21, full_name: 'Ananya Sharma', email: 'ananya@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'B.Des', availability: 'Weekends', bio: 'Design student exploring thoughtful product interfaces and visual systems.', skills: ['Figma', 'UI design', 'Canva'], resume_label: 'Ananya_Sharma_Resume.pdf', projects: [{ title: 'Study planner', stack: 'Figma · UX research', description: 'A simple planning concept for students balancing classes and projects.', repoUrl: '', liveUrl: '' }] },
  { id: 22, full_name: 'Rohan Mehta', email: 'rohan@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'B.Tech CSE', availability: 'Weekends', bio: 'Computer science student interested in clear explanations and strong JavaScript foundations.', skills: ['JavaScript', 'React', 'Problem solving'], resume_label: 'Rohan_Mehta_Resume.pdf', projects: [{ title: 'Interview pattern notes', stack: 'JavaScript · Markdown', description: 'A collection of practical coding patterns for student interviews.', repoUrl: '', liveUrl: '' }] },
  { id: 23, full_name: 'Meera Kapoor', email: 'meera@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'BBA', availability: 'Weekdays', bio: 'Business student building a practical personal brand through campus projects and community work.', skills: ['Content strategy', 'Canva', 'Communication'], resume_label: 'Meera_Kapoor_Resume.pdf', projects: [{ title: 'Campus creator guide', stack: 'Canva · Content', description: 'A starter guide for students presenting their skills online.', repoUrl: '', liveUrl: '' }] },
];

const INITIAL_RECRUITERS = [
  { recruiter_id: 1, full_name: 'Gurpreet Singh', email: 'gurpreet@tech.example', password: 'password123', company_name: 'Spy Tech', job_title: 'Manager', industry: 'Tech' },
];

const INITIAL_JOBS = [
  { id: 1, recruiter_id: 1, title: 'Frontend Developer', work_type: 'Hybrid', location: 'Village Jansla, near Chitkara University', hours: '15-20 hours', pay: '250', vacancies: 2, description: 'Helps to develop Frontend Using AI tools, must have good Design knowledge.', status: 'Active', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 2, recruiter_id: 1, title: 'Database Manager', work_type: 'Hybrid', location: 'Village Jansla, near Chitkara University', hours: '6-10 hours', pay: '220', vacancies: 1, description: 'Helps in database bugs finding and must know about database queries and optimisations.', status: 'Active', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const INITIAL_SKILL_SESSIONS = [
  { id: 101, student_id: 1, title: 'React hooks, made practical', teacher: 'Rahul Sharma', topic: 'Development', level: 'Intermediate', time: 'Wednesday · 5:00 PM', duration: '60 min', seats: 3, color: 'teal', description: 'Build a small counter and learn when to use useState, useEffect, and custom hooks.', meetingLink: '' },
  { id: 102, student_id: 21, title: 'Figma for first portfolios', teacher: 'Ananya Sharma', topic: 'Design', level: 'Beginner', time: 'Saturday · 11:00 AM', duration: '75 min', seats: 4, color: 'gold', description: 'Learn a simple workflow to design your first portfolio screen with Figma.', meetingLink: '' },
  { id: 103, student_id: 22, title: 'JavaScript interview patterns', teacher: 'Rohan Mehta', topic: 'Development', level: 'Intermediate', time: 'Sunday · 4:00 PM', duration: '60 min', seats: 2, color: 'blue', description: 'Practice common array, string, and object questions with a calm problem-solving approach.', meetingLink: '' },
  { id: 104, student_id: 23, title: 'Build your personal brand', teacher: 'Meera Kapoor', topic: 'Career', level: 'All levels', time: 'Monday · 6:30 PM', duration: '45 min', seats: 7, color: 'coral', description: 'Turn your projects and interests into a profile that recruiters can understand quickly.', meetingLink: '' },
];

const INITIAL_APPLICATIONS = [
  { id: 401, job_id: 1, student_id: 1, status: 'Applied', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const loadStoredApplications = () => {
  try {
    const raw = localStorage.getItem('kairos_applications');
    let apps = raw ? JSON.parse(raw) : [...INITIAL_APPLICATIONS];
    const jobsRaw = localStorage.getItem('kairos_jobs');
    const jobsList = jobsRaw ? JSON.parse(jobsRaw) : INITIAL_JOBS;
    let modified = false;
    apps = apps.map((app) => {
      const job = jobsList.find((j) => Number(j.id) === Number(app.job_id));
      const vac = job?.vacancies !== undefined ? Number(job.vacancies) : 1;
      if (job && vac <= 0 && app.status !== 'Accepted' && app.status !== 'Rejected') {
        app.status = 'Rejected';
        app.auto_rejected = true;
        app.rejected_reason = 'All vacancies filled';
        modified = true;
      }
      return app;
    });
    if (modified) {
      localStorage.setItem('kairos_applications', JSON.stringify(apps));
    }
    return apps;
  } catch {}
  return [...INITIAL_APPLICATIONS];
};

const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem('kairos_applications', JSON.stringify(apps));
    window.dispatchEvent(new Event('kairos_application_updated'));
  } catch {}
};

const loadStoredJobs = () => {
  try {
    const raw = localStorage.getItem('kairos_jobs');
    let items = raw ? JSON.parse(raw) : [...INITIAL_JOBS];
    let modified = false;
    items = items.map((j) => {
      const vac = j.vacancies !== undefined ? Number(j.vacancies) : 1;
      if (vac <= 0 && j.status !== 'Paused') {
        j.status = 'Paused';
        modified = true;
      }
      return j;
    });
    if (modified) {
      localStorage.setItem('kairos_jobs', JSON.stringify(items));
    }
    return items;
  } catch {}
  return [...INITIAL_JOBS];
};

const saveStoredJobs = (items) => {
  try {
    localStorage.setItem('kairos_jobs', JSON.stringify(items));
    window.dispatchEvent(new Event('kairos_jobs_updated'));
    window.dispatchEvent(new Event('kairos_application_updated'));
  } catch {}
};

const INITIAL_SESSION_BOOKINGS = [
  { id: 501, student_id: 21, session_id: 101 },
  { id: 502, student_id: 1, session_id: 102 },
];

const loadStoredSessions = () => {
  try {
    const raw = localStorage.getItem('kairos_skill_sessions');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_SKILL_SESSIONS];
};

const saveStoredSessions = (items) => {
  try {
    localStorage.setItem('kairos_skill_sessions', JSON.stringify(items));
    window.dispatchEvent(new Event('kairos_sessions_updated'));
  } catch {}
};

const loadStoredBookings = () => {
  try {
    const raw = localStorage.getItem('kairos_session_bookings');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_SESSION_BOOKINGS];
};

const saveStoredBookings = (bookings) => {
  try {
    localStorage.setItem('kairos_session_bookings', JSON.stringify(bookings));
    window.dispatchEvent(new Event('kairos_sessions_updated'));
  } catch {}
};

const loadStoredStudents = () => {
  try {
    const raw = localStorage.getItem('kairos_students');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_STUDENTS];
};

const saveStoredStudents = (items) => {
  try {
    localStorage.setItem('kairos_students', JSON.stringify(items));
  } catch {}
};

const loadStoredRecruiters = () => {
  try {
    const raw = localStorage.getItem('kairos_recruiters');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...INITIAL_RECRUITERS];
};

const saveStoredRecruiters = (items) => {
  try {
    localStorage.setItem('kairos_recruiters', JSON.stringify(items));
  } catch {}
};

// In-Memory Store
let students = loadStoredStudents();
let recruiters = loadStoredRecruiters();
let jobs = loadStoredJobs();
let applications = loadStoredApplications();
let savedJobs = [];
let skillSessions = loadStoredSessions();
let sessionBookings = loadStoredBookings();
const uploadedResumes = new Map();

const asyncWrap = (fn) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, 40);
  });

const mockApi = {
  // Auth
  login: async ({ email, password, role, company = '' }) =>
    asyncWrap(() => {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (role === 'Student') {
        const student = students.find((s) => s.email.toLowerCase() === normalizedEmail);
        if (!student || student.password !== password) throw new Error('Invalid email or password.');
        return { id: student.id, name: student.full_name, email: student.email, role: 'Student', company: '' };
      } else {
        const recruiter = recruiters.find((r) => r.email.toLowerCase() === normalizedEmail);
        if (!recruiter || recruiter.password !== password || recruiter.company_name.trim().toLowerCase() !== company.trim().toLowerCase()) {
          throw new Error('Invalid email, password, or company name.');
        }
        return { id: recruiter.recruiter_id, name: recruiter.full_name, email: recruiter.email, role: 'Recruiter', company: recruiter.company_name };
      }
    }),

  register: async (userData) =>
    asyncWrap(() => {
      const { name, email, password, role, college, course, availability, company, jobTitle, industry } = userData;
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (role === 'Student') {
        students = loadStoredStudents();
        if (students.some((s) => s.email.toLowerCase() === normalizedEmail)) throw new Error('Email already registered.');
        const newStudent = { id: Date.now(), full_name: name.trim(), email: normalizedEmail, password, college: college?.trim() || '', course: course?.trim() || '', availability: availability || '' };
        students.push(newStudent);
        saveStoredStudents(students);
        return { id: newStudent.id, name: newStudent.full_name, email: newStudent.email, role: 'Student', company: '' };
      } else {
        recruiters = loadStoredRecruiters();
        if (recruiters.some((r) => r.email.toLowerCase() === normalizedEmail)) throw new Error('Email already registered.');
        const newRecruiter = { recruiter_id: Date.now(), full_name: name.trim(), email: normalizedEmail, password, company_name: company?.trim() || '', job_title: jobTitle?.trim() || '', industry: industry || '' };
        recruiters.push(newRecruiter);
        saveStoredRecruiters(recruiters);
        return { id: newRecruiter.recruiter_id, name: newRecruiter.full_name, email: newRecruiter.email, role: 'Recruiter', company: newRecruiter.company_name };
      }
    }),

  changePassword: async ({ email, role = 'Student', newPassword, confirmPassword }) =>
    asyncWrap(() => {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!newPassword || newPassword !== confirmPassword) throw new Error('Passwords do not match.');
      const isStudent = role === 'Student';
      const list = isStudent ? loadStoredStudents() : loadStoredRecruiters();
      const user = list.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) throw new Error('Account not found with this email.');
      user.password = newPassword;
      if (isStudent) saveStoredStudents(list);
      else saveStoredRecruiters(list);
      return { success: true, message: 'Password reset successfully.' };
    }),

  // Profile
  getProfile: async (userId, role) =>
    asyncWrap(() => {
      if (role === 'Student') {
        students = loadStoredStudents();
        const s = students.find((item) => Number(item.id) === Number(userId));
        if (!s) throw new Error('Student not found.');
        return { name: s.full_name, email: s.email, college: s.college, course: s.course, availability: s.availability };
      } else {
        recruiters = loadStoredRecruiters();
        const r = recruiters.find((item) => Number(item.recruiter_id) === Number(userId));
        if (!r) throw new Error('Recruiter not found.');
        return { name: r.full_name, email: r.email, company: r.company_name, jobTitle: r.job_title, industry: r.industry };
      }
    }),

  getStudentPortfolio: async (studentId) =>
    asyncWrap(() => {
      students = loadStoredStudents();
      let student = students.find((item) => Number(item.id) === Number(studentId));
      if (!student) {
        applications = loadStoredApplications();
        const app = applications.find((a) => Number(a.student_id) === Number(studentId));
        if (app) {
          student = {
            id: studentId,
            full_name: app.student_name || 'Student Applicant',
            email: app.student_email || '',
            college: app.college || '',
            course: app.course || '',
          };
        } else {
          sessionBookings = loadStoredBookings();
          const booking = sessionBookings.find((b) => Number(b.student_id) === Number(studentId));
          if (booking) {
            student = {
              id: studentId,
              full_name: booking.name || 'Student Attendee',
              email: '',
              college: booking.college || '',
              course: booking.course || '',
            };
          } else {
            skillSessions = loadStoredSessions();
            const sess = skillSessions.find((s) => Number(s.student_id) === Number(studentId));
            if (sess) {
              student = {
                id: studentId,
                full_name: sess.teacher || 'Student Host',
                email: '',
                college: '',
                course: '',
              };
            }
          }
        }
      }
      if (!student) {
        student = {
          id: studentId,
          full_name: 'Student',
          email: '',
          college: '',
          course: '',
        };
      }
      return {
        id: student.id,
        name: student.full_name || 'Student',
        email: student.email || '',
        college: student.college || '',
        course: student.course || '',
        availability: student.availability || '',
        bio: student.bio || '',
        skills: Array.isArray(student.skills) ? student.skills : [],
        resumeLabel: student.resume_label || '',
        projects: Array.isArray(student.projects) ? student.projects : [],
        resumeFile: uploadedResumes.get(Number(student.id)) || null,
      };
    }),

  updateStudentPortfolio: async (studentId, portfolio) =>
    asyncWrap(() => {
      students = loadStoredStudents();
      const student = students.find((item) => Number(item.id) === Number(studentId));
      if (!student) throw new Error('Student profile not found.');
      student.bio = portfolio.bio.trim();
      student.skills = portfolio.skills;
      student.resume_label = portfolio.resumeLabel.trim();
      student.projects = portfolio.projects;
      saveStoredStudents(students);
      return { success: true };
    }),

  uploadStudentResume: async (studentId, file) =>
    asyncWrap(() => {
      if (!file) throw new Error('Choose a resume file first.');
      if (file.size > 5 * 1024 * 1024) throw new Error('Resume must be 5 MB or smaller.');
      students = loadStoredStudents();
      const student = students.find((item) => Number(item.id) === Number(studentId));
      if (!student) throw new Error('Student profile not found.');
      uploadedResumes.set(Number(studentId), file);
      student.resume_label = file.name;
      saveStoredStudents(students);
      return { name: file.name };
    }),

  updateProfile: async ({ userId, role, profile }) =>
    asyncWrap(() => {
      if (role === 'Student') {
        students = loadStoredStudents();
        const s = students.find((item) => Number(item.id) === Number(userId));
        if (!s) throw new Error('Student not found.');
        Object.assign(s, { full_name: profile.name, email: profile.email, college: profile.college, course: profile.course, availability: profile.availability });
        saveStoredStudents(students);
        return { id: s.id, name: s.full_name, email: s.email, role: 'Student', company: '' };
      } else {
        recruiters = loadStoredRecruiters();
        const r = recruiters.find((item) => Number(item.recruiter_id) === Number(userId));
        if (!r) throw new Error('Recruiter not found.');
        Object.assign(r, { full_name: profile.name, email: profile.email, company_name: profile.company, job_title: profile.jobTitle, industry: profile.industry });
        saveStoredRecruiters(recruiters);
        return { id: r.recruiter_id, name: r.full_name, email: r.email, role: 'Recruiter', company: r.company_name };
      }
    }),

  // Student Actions
  getJobById: async (jobId) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      recruiters = loadStoredRecruiters();
      const job = jobs.find((j) => Number(j.id) === Number(jobId));
      if (!job) return null;
      const recruiter = recruiters.find((r) => Number(r.recruiter_id) === Number(job.recruiter_id)) || {};
      const vacancies = job.vacancies !== undefined ? Number(job.vacancies) : 1;
      return {
        id: job.id,
        recruiter_id: job.recruiter_id,
        title: job.title,
        company: recruiter.company_name || job.company || 'Dr Tea Cafe',
        recruiter_name: recruiter.full_name || job.recruiter_name || 'Hiring Team',
        recruiter_email: recruiter.email || job.recruiter_email || '',
        recruiter_role: recruiter.job_title || job.recruiter_role || 'Recruiter',
        industry: recruiter.industry || job.industry || 'Food & hospitality',
        type: job.work_type,
        location: job.location,
        hours: job.hours,
        pay: job.pay,
        vacancies,
        description: job.description,
        status: vacancies <= 0 ? 'Paused' : job.status,
        posted: 'recently',
      };
    }),

  getActiveJobs: async (studentId) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      applications = loadStoredApplications();
      recruiters = loadStoredRecruiters();
      const studentDecisionJobIds = studentId
        ? new Set(
            applications
              .filter(
                (a) =>
                  Number(a.student_id) === Number(studentId) &&
                  (a.status === 'Accepted' || a.status === 'Rejected')
              )
              .map((a) => Number(a.job_id))
          )
        : new Set();
      return jobs
        .filter((j) => {
          const vac = j.vacancies !== undefined ? Number(j.vacancies) : 1;
          const isLive = j.status === 'Active' && vac > 0;
          return isLive || studentDecisionJobIds.has(Number(j.id));
        })
        .map((job) => {
          const recruiter = recruiters.find((r) => r.recruiter_id === job.recruiter_id) || {};
          const vacancies = job.vacancies !== undefined ? Number(job.vacancies) : 1;
          return {
            id: job.id,
            recruiter_id: job.recruiter_id,
            title: job.title,
            company: recruiter.company_name || job.company || 'Dr Tea Cafe',
            recruiter_name: recruiter.full_name || job.recruiter_name || 'Hiring Team',
            recruiter_email: recruiter.email || '',
            recruiter_role: recruiter.job_title || 'Recruiter',
            industry: recruiter.industry || 'Food & hospitality',
            type: job.work_type,
            location: job.location,
            hours: job.hours,
            pay: job.pay,
            vacancies,
            description: job.description,
            status: vacancies <= 0 ? 'Paused' : job.status,
            posted: 'recently',
          };
        });
    }),

  getRecruiterCompanyProfile: async (recruiterId) =>
    asyncWrap(() => {
      recruiters = loadStoredRecruiters();
      jobs = loadStoredJobs();
      let recruiter = recruiters.find((item) => Number(item.recruiter_id) === Number(recruiterId));
      if (!recruiter) {
        const relatedJob = jobs.find((job) => Number(job.recruiter_id) === Number(recruiterId));
        if (relatedJob) {
          recruiter = {
            recruiter_id: Number(recruiterId),
            company_name: relatedJob.company || '',
            full_name: relatedJob.recruiter_name || '',
            job_title: relatedJob.recruiter_role || '',
            email: relatedJob.recruiter_email || '',
            industry: relatedJob.industry || '',
          };
        }
      }
      if (!recruiter) {
        recruiter = {
          recruiter_id: Number(recruiterId),
          company_name: '',
          full_name: '',
          job_title: '',
          email: '',
          industry: '',
        };
      }
      const activeRoles = jobs
        .filter((job) => {
          const vac = job.vacancies !== undefined ? Number(job.vacancies) : 1;
          return Number(job.recruiter_id) === Number(recruiterId) && job.status === 'Active' && vac > 0;
        })
        .map((job) => ({ id: job.id, title: job.title, type: job.work_type, location: job.location, hours: job.hours, pay: job.pay }));
      return {
        id: recruiter.recruiter_id,
        company: recruiter.company_name || '',
        industry: recruiter.industry || '',
        contactName: recruiter.full_name || '',
        contactRole: recruiter.job_title || '',
        email: recruiter.email || '',
        activeRoles,
      };
    }),

  getSavedJobIds: async (studentId) =>
    asyncWrap(() => savedJobs.filter((s) => Number(s.student_id) === Number(studentId)).map((s) => Number(s.job_id))),

  saveJob: async (studentId, jobId) =>
    asyncWrap(() => {
      if (!savedJobs.some((s) => Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId))) {
        savedJobs.push({ student_id: Number(studentId), job_id: Number(jobId) });
      }
      return { message: 'Job saved.' };
    }),

  removeSavedJob: async (studentId, jobId) =>
    asyncWrap(() => {
      savedJobs = savedJobs.filter((s) => !(Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId)));
      return { message: 'Saved job removed.' };
    }),

  applyForJob: async (jobId, studentId) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      const job = jobs.find((j) => Number(j.id) === Number(jobId));
      if (!job) throw new Error('Job listing not found.');

      const vacancies = job.vacancies !== undefined ? Number(job.vacancies) : 1;
      if (job.status === 'Paused' || vacancies <= 0) {
        throw new Error('This job listing is currently paused and not accepting new applications.');
      }

      applications = loadStoredApplications();
      students = loadStoredStudents();
      const student = students.find((s) => Number(s.id) === Number(studentId));
      const existing = applications.find((a) => Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId));
      if (!existing) {
        applications.push({
          id: Date.now(),
          job_id: Number(jobId),
          student_id: Number(studentId),
          student_name: student?.full_name || 'Student',
          student_email: student?.email || '',
          college: student?.college || '',
          course: student?.course || '',
          status: 'Applied',
          created_at: new Date().toISOString()
        });
      } else {
        if (existing.status === 'Accepted' || existing.status === 'Rejected') {
          throw new Error(`Your application for this job has already been ${existing.status.toLowerCase()}.`);
        }
        existing.status = 'Applied';
        existing.created_at = new Date().toISOString();
        if (student) {
          existing.student_name = student.full_name;
          existing.student_email = student.email;
          existing.college = student.college;
          existing.course = student.course;
        }
      }
      saveStoredApplications(applications);
      return { message: 'Applied successfully.' };
    }),

  withdrawApplication: async (jobId, studentId) =>
    asyncWrap(() => {
      applications = loadStoredApplications();
      jobs = loadStoredJobs();

      const appIndex = applications.findIndex(
        (a) => Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId)
      );
      if (appIndex === -1) {
        return { message: 'Application not found or already withdrawn.' };
      }

      const existingApp = applications[appIndex];
      if (existingApp.status === 'Accepted') {
        throw new Error('Application cannot be withdrawn once you have been selected.');
      }

      applications.splice(appIndex, 1);
      saveStoredApplications(applications);

      return {
        message: 'Application withdrawn.',
        wasAccepted: false,
        jobReactivated: false,
      };
    }),

  getStudentApplications: async (studentId) =>
    asyncWrap(() => {
      applications = loadStoredApplications();
      jobs = loadStoredJobs();
      recruiters = loadStoredRecruiters();
      return applications
        .filter((a) => Number(a.student_id) === Number(studentId))
        .map((app) => {
          const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
          const recruiter = recruiters.find((r) => Number(r.recruiter_id) === Number(job.recruiter_id)) || {};
          return {
            application_id: app.id,
            job_id: app.job_id,
            job_title: job.title || 'Job Listing',
            job_status: job.status || 'Active',
            vacancies: job.vacancies !== undefined ? Number(job.vacancies) : 1,
            work_type: job.work_type || 'On-site',
            location: job.location || '',
            pay: job.pay || '',
            hours: job.hours || '',
            status: app.status || 'Applied',
            recruiter_name: recruiter.full_name || 'Hiring Manager',
            company_name: recruiter.company_name || 'Verified Company',
            recruiter_email: recruiter.email || '',
          };
        })
        .filter((app) => {
          // Don't show paused applications to students
          const isPaused = app.job_status === 'Paused' || app.vacancies <= 0;
          if (isPaused && app.status !== 'Accepted' && app.status !== 'Rejected') {
            return false;
          }
          return true;
        });
    }),

  // Recruiter Actions
  getRecruiterJobs: async (recruiterId) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      return jobs
        .filter((j) => Number(j.recruiter_id) === Number(recruiterId))
        .map((job) => ({
          id: job.id,
          title: job.title,
          type: job.work_type,
          location: job.location,
          hours: job.hours,
          pay: job.pay,
          vacancies: job.vacancies !== undefined ? Number(job.vacancies) : 1,
          description: job.description,
          status: job.status,
          posted: 'recently',
        }));
    }),

  getRecruiterApplications: async (recruiterId) =>
    asyncWrap(() => {
      applications = loadStoredApplications();
      jobs = loadStoredJobs();
      students = loadStoredStudents();
      const recruiterJobIds = new Set(jobs.filter((j) => Number(j.recruiter_id) === Number(recruiterId)).map((j) => Number(j.id)));
      return applications
        .filter((a) => recruiterJobIds.has(Number(a.job_id)))
        .map((app) => {
          const student = students.find((s) => Number(s.id) === Number(app.student_id)) || {};
          const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
          return {
            application_id: app.id,
            job_id: app.job_id,
            job_title: job.title || 'Job Listing',
            status: app.status || 'Applied',
            applied_at: 'recently',
            student_id: student.id || app.student_id,
            student_name: student.full_name || app.student_name || 'Student Applicant',
            student_email: student.email || app.student_email || '',
            college: student.college || app.college || '',
            course: student.course || app.course || '',
            availability: student.availability || 'Flexible',
          };
        });
    }),

  updateApplicationStatus: async (applicationId, _recruiterId, newStatus) =>
    asyncWrap(() => {
      applications = loadStoredApplications();
      jobs = loadStoredJobs();
      const app = applications.find((a) => Number(a.id) === Number(applicationId));
      if (!app) throw new Error('Application not found.');
      if (app.status === 'Accepted' || app.status === 'Rejected') {
        throw new Error(`Application decision is final (${app.status}) and cannot be changed.`);
      }
      // When someone's job application is accepted: reduce open positions by 1 and auto-pause if no positions left
      let autoPaused = false;
      let remainingVacancies = 0;
      const autoRejectedApplicants = [];
      if (newStatus === 'Accepted') {
        const job = jobs.find((j) => Number(j.id) === Number(app.job_id));
        if (!job) throw new Error('Job listing not found.');
        const currentVacancies = job.vacancies !== undefined ? Number(job.vacancies) : 1;
        if (currentVacancies <= 0) {
          throw new Error('All vacancies for this role have already been filled.');
        }
        job.vacancies = Math.max(0, currentVacancies - 1);
        remainingVacancies = job.vacancies;
        if (job.vacancies === 0) {
          job.status = 'Paused';
          autoPaused = true;

          // Auto-reject all other pending applications for this job
          applications.forEach((otherApp) => {
            if (
              Number(otherApp.job_id) === Number(job.id) &&
              Number(otherApp.id) !== Number(app.id) &&
              otherApp.status !== 'Accepted' &&
              otherApp.status !== 'Rejected'
            ) {
              otherApp.status = 'Rejected';
              otherApp.auto_rejected = true;
              otherApp.rejected_reason = 'All vacancies filled';
              autoRejectedApplicants.push({
                application_id: otherApp.id,
                student_id: otherApp.student_id,
                student_name: otherApp.student_name,
                job_id: job.id,
                job_title: job.title,
              });
            }
          });
        }
        saveStoredJobs(jobs);
      }

      app.status = newStatus;
      saveStoredApplications(applications);

      return {
        message: `Application ${newStatus.toLowerCase()} successfully.`,
        autoPaused,
        vacancies: remainingVacancies,
        autoRejectedApplicants,
      };
    }),

  postJob: async (jobData) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      const { recruiterId, title, type, location, hours, pay, vacancies, description } = jobData;
      const parsedVacancies = vacancies !== undefined ? Math.max(0, Number(vacancies)) : 1;
      const newJob = {
        id: Date.now(),
        recruiter_id: Number(recruiterId),
        title: title.trim(),
        work_type: type,
        location: location.trim(),
        hours,
        pay: pay.trim(),
        vacancies: parsedVacancies,
        description: description.trim(),
        status: parsedVacancies === 0 ? 'Paused' : 'Active',
        created_at: new Date().toISOString(),
      };
      jobs.unshift(newJob);
      saveStoredJobs(jobs);
      return { id: newJob.id };
    }),

  updateJobStatus: async (jobId, _recruiterId, status) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      const job = jobs.find((j) => Number(j.id) === Number(jobId));
      if (!job) throw new Error('Job not found.');
      const vac = job.vacancies !== undefined ? Number(job.vacancies) : 1;
      if (status === 'Active' && vac <= 0) {
        throw new Error('Cannot activate listing with 0 vacancies. Vacancies must be greater than 0.');
      }
      job.status = status;
      saveStoredJobs(jobs);
      return { message: 'Job updated.' };
    }),

  deleteJob: async (jobId) =>
    asyncWrap(() => {
      jobs = loadStoredJobs();
      jobs = jobs.filter((j) => Number(j.id) !== Number(jobId));
      saveStoredJobs(jobs);
      applications = loadStoredApplications();
      applications = applications.filter((a) => Number(a.job_id) !== Number(jobId));
      saveStoredApplications(applications);
      savedJobs = savedJobs.filter((s) => Number(s.job_id) !== Number(jobId));
      return { message: 'Job removed.' };
    }),

  // Skill Exchange Actions
  getSkillSessions: async () =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      return skillSessions.map((session) => ({ ...session }));
    }),

  getStudentSkillSessions: async (studentId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      return skillSessions.filter((session) => Number(session.student_id) === Number(studentId)).map((session) => ({ ...session }));
    }),

  createSkillSession: async ({ studentId, teacher, title, topic, level, time, duration, seats, description, meetingLink = '' }) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      const newSession = {
        id: Date.now(), student_id: Number(studentId), teacher: teacher.trim(), title: title.trim(), topic, level,
        time: time.trim(), duration: duration.trim(), seats: Number(seats), description: description.trim(), color: 'teal',
        meetingLink: (meetingLink || '').trim(),
      };
      skillSessions.unshift(newSession);
      saveStoredSessions(skillSessions);
      return { ...newSession };
    }),

  updateSkillSession: async (sessionId, studentId, updates) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (!session || Number(session.student_id) !== Number(studentId)) throw new Error('Session not found or you do not have permission to edit it.');
      Object.assign(session, {
        ...updates,
        title: updates.title !== undefined ? updates.title.trim() : session.title,
        time: updates.time !== undefined ? updates.time.trim() : session.time,
        duration: updates.duration !== undefined ? updates.duration.trim() : session.duration,
        description: updates.description !== undefined ? updates.description.trim() : session.description,
        seats: updates.seats !== undefined ? Number(updates.seats) : session.seats,
        meetingLink: updates.meetingLink !== undefined ? (updates.meetingLink || '').trim() : (session.meetingLink || ''),
      });
      saveStoredSessions(skillSessions);
      return { ...session };
    }),

  setSkillSessionMeetingLink: async (sessionId, studentId, meetingLink) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (!session || Number(session.student_id) !== Number(studentId)) {
        throw new Error('Session not found or you do not have permission to provide a link for it.');
      }
      session.meetingLink = (meetingLink || '').trim();
      saveStoredSessions(skillSessions);
      return { ...session };
    }),

  deleteSkillSession: async (sessionId, studentId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (!session || Number(session.student_id) !== Number(studentId)) throw new Error('Session not found or you do not have permission to delete it.');
      skillSessions = skillSessions.filter((item) => Number(item.id) !== Number(sessionId));
      saveStoredSessions(skillSessions);
      return { message: 'Session deleted.' };
    }),

  getBookedSkillSessions: async (studentId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      sessionBookings = loadStoredBookings();
      const bookedIds = new Set(sessionBookings.filter((booking) => Number(booking.student_id) === Number(studentId)).map((booking) => Number(booking.session_id)));
      return skillSessions.filter((session) => bookedIds.has(Number(session.id))).map((session) => ({ ...session }));
    }),

  getSkillSessionBookings: async (sessionId, teacherId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      sessionBookings = loadStoredBookings();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (!session || Number(session.student_id) !== Number(teacherId)) throw new Error('Session not found or you do not have permission to view attendees.');
      return sessionBookings
        .filter((booking) => Number(booking.session_id) === Number(sessionId))
        .map((booking) => {
          const student = students.find((item) => Number(item.id) === Number(booking.student_id));
          return { bookingId: booking.id, studentId: booking.student_id, name: student?.full_name || 'Student', college: student?.college || '', course: student?.course || '' };
        });
    }),

  bookSkillSession: async (studentId, sessionId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      sessionBookings = loadStoredBookings();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (!session) throw new Error('This session is no longer available.');
      if (Number(session.student_id) === Number(studentId)) throw new Error('You cannot book your own session.');
      if (sessionBookings.some((booking) => Number(booking.student_id) === Number(studentId) && Number(booking.session_id) === Number(sessionId))) return { message: 'Already booked.' };
      if (Number(session.seats) <= 0) throw new Error('No seats left for this session.');
      session.seats = Math.max(0, Number(session.seats) - 1);
      sessionBookings.push({ id: Date.now(), student_id: Number(studentId), session_id: Number(sessionId) });
      saveStoredSessions(skillSessions);
      saveStoredBookings(sessionBookings);
      return { message: 'Session booked.', seats: session.seats };
    }),

  cancelSkillSessionBooking: async (studentId, sessionId) =>
    asyncWrap(() => {
      skillSessions = loadStoredSessions();
      sessionBookings = loadStoredBookings();
      const session = skillSessions.find((item) => Number(item.id) === Number(sessionId));
      if (session && session.meetingLink && session.meetingLink.trim()) {
        throw new Error('This session cannot be cancelled because the meeting link has already been provided.');
      }
      const hadBooking = sessionBookings.some((booking) => Number(booking.student_id) === Number(studentId) && Number(booking.session_id) === Number(sessionId));
      if (hadBooking && session) {
        session.seats = Number(session.seats) + 1;
        saveStoredSessions(skillSessions);
      }
      sessionBookings = sessionBookings.filter((booking) => !(Number(booking.student_id) === Number(studentId) && Number(booking.session_id) === Number(sessionId)));
      saveStoredBookings(sessionBookings);
      return { message: 'Booking cancelled.' };
    }),

  resetToDemoData: () => {
    students = [...INITIAL_STUDENTS];
    recruiters = [...INITIAL_RECRUITERS];
    jobs = [...INITIAL_JOBS];
    applications = [];
    savedJobs = [];
    skillSessions = [...INITIAL_SKILL_SESSIONS];
    sessionBookings = [...INITIAL_SESSION_BOOKINGS];
    saveStoredJobs(jobs);
    saveStoredApplications(applications);
    saveStoredSessions(skillSessions);
    saveStoredBookings(sessionBookings);
  },
};

export const api = mockApi;
