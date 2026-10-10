# Kairos - Application User & Data Flow Guide

This document outlines the complete user journeys, data flow, status lifecycles, and cross-cutting event mechanisms across the Kairos platform.

---

## 1. High-Level System Flow Diagram

```mermaid
flowchart TD
    Start([Visitor Arrives]) --> Landing[Landing Page /]
    Landing -->|Click Get Started / Sign In| Auth[Login & Register /login, /register]
    
    Auth -->|Select Student Role| StudentCheck{Authenticated?}
    Auth -->|Select Recruiter Role| RecruiterCheck{Authenticated?}

    StudentCheck -->|Yes| StudentDash[Student Workspace /student]
    RecruiterCheck -->|Yes| RecruiterDash[Recruiter Workspace /recruiter]

    subgraph StudentFlow ["🎓 Student Workspace Journey"]
        StudentDash --> TabJobs[Job Discovery & Search]
        StudentDash --> TabApps[My Applications]
        StudentDash --> TabSkills[Peer Skill Exchange]
        StudentDash --> TabBooked[Booked Sessions]
        StudentDash --> TabCreateSess[Create Skill Session]
        StudentDash --> TabMySess[My Hosted Sessions]
        StudentDash --> TabProfile[Portfolio & Resume /portfolio/edit]
    end

    subgraph RecruiterFlow ["🏢 Recruiter Workspace Journey"]
        RecruiterDash --> MergedView[Merged View: My Listings & Post Role]
        MergedView -->|Left Column| PostJobForm[Post Part-time Job Form]
        MergedView -->|Right Column| PostedListings[Posted Jobs & Live Applicants]
        RecruiterDash --> TabApplicants[Candidate Review Pipeline]
    end

    subgraph CrossCutting ["⚙️ Cross-Cutting Features"]
        Settings[Sidebar Settings: Profile, Theme Light/Dark, Log out]
        Notifs[Notification Popover & Toast Alerts]
        Shortcuts[Keyboard Shortcut: Ctrl + B to Sign Out]
    end

    StudentDash -.-> CrossCutting
    RecruiterDash -.-> CrossCutting
```

---

## 2. Authentication & Authorization Flow

1. **Visitor Landing**:
   - The user visits the app root (`/#/`).
   - The landing page showcases the value proposition, live stats, student peer exchange, and dual entry points.

2. **Login / Registration**:
   - Route: `/#/login` or `/#/register`.
   - Dual-role switch: `Student` or `Recruiter`.
   - **Demo Accounts Button**: Quick-fill dropdown at the top of the login screen allows instant evaluation without typing credentials.
   - Upon successful credentials verification in `api.login()`, the user object and authentication token are saved in `AuthContext` (persisted in `localStorage`).

3. **Role-Based Redirection (`ProtectedRoute.jsx`)**:
   - Checks if user is authenticated: if not, redirects to `/login`.
   - Checks if user has the required role (`allowedRole`):
     - `Student` trying to access `/recruiter` is redirected to `/student`.
     - `Recruiter` trying to access `/student` is redirected to `/recruiter`.

---

## 3. Student Workflow Details

### A. Job Discovery & Application Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as StudentDashboard
    participant Store as Redux (jobsSlice)
    participant API as api.js (Mock Service)
    participant Recruiter as RecruiterDashboard

    Student->>UI: Enter search term or select filter tab (All/Saved/Applied/Accepted)
    UI->>UI: Filter jobs locally using useMemo
    Student->>UI: Click "Apply" on Job Card
    UI->>API: api.applyToJob(studentId, jobId)
    API-->>UI: Return updated application status ("Applied")
    UI->>UI: Trigger toast: "Application submitted"
    UI->>Recruiter: Emit CustomEvent 'kairos_application_updated'
    Note over Recruiter: Recruiter view automatically refreshes to display new applicant!
```

1. **Browse Roles**: Students filter through campus and hybrid jobs by keyword, category, or status tab.
2. **Detailed View**: Clicking a job navigates to `/#/jobs/:jobId` with full description, recruiter company details, and compensation.
3. **Save for Later**: Clicking the bookmark icon toggles saved jobs instantly.
4. **My Applications Tab**: Tracks all submitted roles, displaying color-coded status badges:
   - `Applied / Under Review` (Gold)
   - `Accepted` (Green badge with employer contact instructions)
   - `Saved` (Blue badge)

### B. Peer Skill Exchange Flow
```mermaid
stateDiagram-v2
    [*] --> BrowseSessions: Open "Skill exchange"
    BrowseSessions --> BookSession: Click "Join session"
    BookSession --> BookedList: Session added to "Booked sessions"
    
    BrowseSessions --> CreateSession: Open "Create session"
    CreateSession --> HostedList: Publish new session (Title, Topic, Time, Seats)
    HostedList --> EditSession: Edit title, time, or capacity
    HostedList --> CancelSession: Delete session
```

1. **Browse Sessions**: Students discover micro-learning workshops hosted by fellow students (e.g., React Hooks, Figma UI, Interview Prep).
2. **Book Seats**: One-click booking with seat counter deduction.
3. **Booked Sessions**: View upcoming schedules with cancel option.
4. **Host a Session**: Form to teach a skill with customizable tags, duration, and seat limits.
5. **Manage Sessions**: Edit details or remove sessions anytime.

### C. Student Portfolio & Resume Flow
- Accessible from sidebar: **Edit portfolio** (`/#/portfolio/edit`) and **View portfolio** (`/#/profile`).
- Students can update their Bio, add taggable Skills, link GitHub/Live projects, and upload a PDF resume file.
- When applying to jobs, recruiters see the student's name, college, course, bio, and resume link.

---

## 4. Recruiter Workflow Details

### A. Unified Job Posting & Management Flow
```mermaid
flowchart LR
    subgraph RecruiterLayout ["Recruiter Workspace (2-Column Grid)"]
        direction TB
        Form["Left: Post a Job Form
        - Title & Arrangement
        - Location & Hours
        - Pay Rate & Vacancies
        - Role Description"]
        
        Listings["Right: Posted Jobs Panel
        - Active filter toggle
        - Pause / Activate button
        - Remove listing button
        - Live Applicant Cards"]
    end

    Form -->|Click 'Publish Job'| Action[dispatch(createJob)]
    Action -->|Instant Live Update| Listings
```

1. **Sidebar Navigation**:
   - **My listings**: Displays the merged two-column layout.
   - **Applicants**: Dedicated candidate review pipeline.
2. **Publishing a Role**:
   - Recruiter completes the job creation form on the left.
   - On submit, job is validated and added to the store via Redux `createJob`.
   - A success notification is shown, and the job appears instantly in the right-hand listings panel without page reload.
3. **Managing Postings**:
   - **Pause/Activate**: Toggles job status so students can or cannot see it in search.
   - **Remove**: Deletes the posting and cleans up related applications.

### B. Candidate Review Pipeline Flow
```mermaid
sequenceDiagram
    autonumber
    actor Recruiter
    participant UI as RecruiterDashboard (Applicants)
    participant API as api.js
    participant Notif as NotificationContext
    actor Student

    Recruiter->>UI: Open "Applicants" tab
    UI->>UI: Displays pending candidate list across all jobs
    Recruiter->>UI: Click "Accept" on applicant card
    UI->>API: api.updateApplicationStatus(appId, recruiterId, 'Accepted')
    API-->>UI: Status updated to 'Accepted'
    UI->>Notif: Add toast & notification: "Applicant accepted"
    UI->>Student: Dispatch 'kairos_application_updated' event
    Note over Student: Student dashboard reflects "Accepted" status badge!
```

- Recruiters can accept student candidates either directly on the job card or in the candidate pipeline.
- Quick `mailto:` button allows direct email communication with accepted students.

---

## 5. Real-Time Cross-Tab & Event Flow

The app maintains synchronized state across multiple browser tabs and components without a heavy websocket server:
- **Custom Event Bus**: `window.dispatchEvent(new CustomEvent('kairos_application_updated'))` fires whenever an application status changes or a new job is posted.
- **Storage Sync**: `window.addEventListener('storage', ...)` syncs session and application states if the recruiter and student workspaces are opened in different tabs or windows.

---

## 6. Theme & Settings Flow

1. **Sidebar Settings Trigger**:
   - Available in both Student and Recruiter sidebars at the bottom.
   - Clicking opens the embedded settings drawer.
2. **Appearance Switch**:
   - Clicking **Light** or **Dark** updates `ThemeContext`.
   - Adds/removes the `.dark-theme` class on `document.body` and saves preference to `localStorage`.
   - All CSS variables dynamically adapt seamlessly.
3. **Sign Out**:
   - Click "Log out" or press <kbd>Ctrl</kbd> + <kbd>B</kbd> keyboard shortcut.
   - Clears credentials from `AuthContext` and redirects to `/login`.
