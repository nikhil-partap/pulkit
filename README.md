# Kairos - Student & Recruiter Part-Time Job Portal

A modern, responsive, 100% React-based web application connecting college students seeking flexible part-time work and peer skill exchange with local recruiters and employers.

Built with **Vite + React 19**, **React Router v7**, **Redux Toolkit**, and **Vanilla CSS** featuring state-driven architecture, dynamic filtering, dark/light theme switching, and role-based workspaces.

---

## 📚 Architectural & Workflow Documentation

For detailed technical diagrams and execution flows, see:
- 📖 [**FLOW.md**](./FLOW.md) — End-to-end user journeys, application state lifecycles, and sequence diagrams.
- 🔗 [**HOW_PROJECT_CONNECTS.md**](./HOW_PROJECT_CONNECTS.md) — Technical architecture, provider hierarchy, Redux/Context state layers, and component wiring.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Setup & Start
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to the local URL (usually `http://localhost:5173` or `http://localhost:5174/Kairos/`).

---

## 🔑 Demo Login Accounts

The project includes pre-configured demo accounts for both roles with instant one-click login via the **"Demo accounts"** dropdown on the sign-in page:

### 1. Student Account
| Field | Value |
| :--- | :--- |
| **Role** | Student |
| **Email** | `rahul@example.com` |
| **Password** | `password123` |
| **Profile** | Rahul Sharma • Chitkara University • BCA |

### 2. Recruiter Account
| Field | Value |
| :--- | :--- |
| **Role** | Recruiter |
| **Company** | `Dr Tea Cafe` |
| **Email** | `gurpreet@drteacafe.example` |
| **Password** | `password123` |
| **Profile** | Gurpreet Singh • Cafe Manager • Food & hospitality |

---

## 🌟 Core Features

### 🎓 Student Workspace (`/#/student`)
- **Live Job Discovery**: Browse campus and local part-time opportunities with search, status filters (All, Applied, Accepted, Saved), pay rates, and hours.
- **Job Details & Apply**: Dedicated role overview with quick apply and instant application status updates.
- **My Applications**: Track all submitted roles with color-coded status badges (`Under Review` vs `Accepted`).
- **Student Portfolio & Resume**:
  - Bio, academic credentials, and taggable skill badges.
  - Showcase GitHub and live project links.
  - Upload and download resume files.
- **Peer Skill Exchange**:
  - Discover micro-workshops hosted by fellow students (React, Figma, Interview prep).
  - One-click seat booking and booking cancellation.
  - Host your own skill session with custom schedule, tags, and capacity.

### 🏢 Recruiter Workspace (`/#/recruiter`)
- **Unified Two-Column Dashboard**:
  - **Left**: Post a part-time role form (title, work arrangement, location, hours, pay rate, vacancies, description).
  - **Right**: Posted job listings panel with filter toggle (`Active only` vs `Show all`).
- **Manage Listings**: Pause/activate listings or remove jobs.
- **Candidate Pipeline**: Review student applicants across all jobs, inspect college/course details, accept candidates, and email directly.

### 🎨 Design & Cross-Cutting Features
- **Sidebar Settings**:
  - Expandable settings menu at the bottom of both student and recruiter sidebars.
  - Edit profile link, **Light / Dark theme** toggles, and sign out.
  - Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>B</kbd> to quickly log out.
- **Notification System**:
  - In-app floating toast alerts for actions (job published, applicant accepted, session booked).
  - Top header notification popover with unread counter and "Read all" action.
- **Cross-Component Synchronization**:
  - Custom event bus synchronizes application updates and listings across tabs and components without page reloads.

---

## 📂 Project Structure

```text
frontend/
├── public/
│   └── favicon.png              # App icon
├── src/
│   ├── components/
│   │   ├── JobCardRecruiter.jsx # Recruiter job card with applicant actions
│   │   ├── JobCardStudent.jsx   # Student job card with apply/save actions
│   │   ├── Navbar.jsx           # Global header with branding & notifications
│   │   ├── ProtectedRoute.jsx   # Role-based route protection
│   │   ├── RecruiterSidebar.jsx # Recruiter workspace navigation & settings
│   │   ├── SessionForm.jsx      # Skill session creation/editing form
│   │   ├── StudentSidebar.jsx   # Student workspace navigation & settings
│   │   └── ToastRegion.jsx      # Global toast notification container
│   ├── context/
│   │   ├── AuthContext.jsx      # User authentication session state
│   │   ├── NotificationContext.jsx # Toast & notification center state
│   │   └── ThemeContext.jsx     # Dark / Light theme state
│   ├── pages/
│   │   ├── BookedSessionsPage.jsx  # Student booked peer sessions
│   │   ├── CreateSessionPage.jsx  # Host a peer skill session
│   │   ├── EditPortfolioPage.jsx  # Portfolio & resume editor
│   │   ├── JobDetailsPage.jsx     # Full job details view
│   │   ├── LandingPage.jsx        # Public landing & feature showcase
│   │   ├── LoginPage.jsx          # Dual-role login with demo auto-fill
│   │   ├── MyApplicationsPage.jsx # Student application tracker
│   │   ├── MySessionsPage.jsx     # Manage hosted skill sessions
│   │   ├── NotFoundPage.jsx       # 404 handler
│   │   ├── NotificationsPage.jsx  # Full notifications archive
│   │   ├── RecruiterDashboard.jsx # Merged post+listings & applicants
│   │   ├── RegisterPage.jsx       # Dual-role account registration
│   │   ├── SettingsPage.jsx       # Profile edit and preferences
│   │   ├── SkillExchangePage.jsx  # Peer skill exchange discovery
│   │   ├── StudentDashboard.jsx   # Student job discovery center
│   │   └── StudentProfilePage.jsx # Public student portfolio view
│   ├── services/
│   │   └── api.js               # In-memory mock service layer & event bus
│   ├── store/
│   │   ├── jobsSlice.js         # Redux Toolkit slice for job listings
│   │   ├── sessionsSlice.js     # Redux Toolkit slice for skill sessions
│   │   └── store.js             # Root Redux store configuration
│   ├── App.jsx                  # Main router and provider tree
│   ├── index.css                # Vanilla CSS design system & dark theme tokens
│   └── main.jsx                 # Vite application entry point
├── package.json
└── vite.config.js
```

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: React Router v7 (`HashRouter`)
- **State Management**: Redux Toolkit + React Context API
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (CSS variables, Dark mode, Responsive flex/grid)
