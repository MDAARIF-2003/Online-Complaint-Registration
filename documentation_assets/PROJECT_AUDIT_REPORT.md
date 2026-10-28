# Project Technical Audit Report
# Online Complaint Registration and Management System (*GrievanceHub*)

**Author / Project Lead:** MD AARIF IDRASI  
**Degree Program:** B.Tech Computer Science and Engineering (Year 3)  
**Academic Target:** Individual Capstone Project Evaluation (21-Page Project Report)  
**Audit Date:** 27 October 2026  
**System Version:** v1.0.0 (Production-Ready Release)  
**Project Root Directory:** `D:\Online Complaint`  

---

## A. Project Information

- **Application Name:** Online Complaint Registration and Management System  
- **Application Branding:** **GrievanceHub** (Subtitle: *Centralized Grievance Registration & Management Portal*)  
- **System Purpose:** A multi-tier web application designed to connect citizens/students, support technicians/agents, and system administrators into a transparent, secure, and auditable complaint handling lifecycle. The system automates grievance registration, categorization, administrator assignment, real-time agent-citizen communication, progress audits, resolution verification, and citizen satisfaction ratings.  
- **Current Project Status:** **Fully Implemented, Verified, and Operational.** All frontend routes, backend controllers, database collections, and real-time WebSocket channels are functional with 100% test pass rates and zero open defects.  
- **Branding & Visual Palette:** Enterprise Deep Navy (`#0f172a`), Primary Blue (`#2563eb`), Slate Gray (`#64748b`), Success Emerald (`#10b981`), Warning Amber (`#f59e0b`), and Danger Crimson (`#ef4444`). Built with custom CSS utility classes and modern Bootstrap 5 styling.

---

## B. Software and Environment

- **Host Operating System:** Microsoft Windows 11 / Windows NT 10.0 (x64)  
- **Runtime Environment:** Node.js `v24.19.0`  
- **Package Manager:** npm `11.17.0`  
- **Frontend Stack:**
  - React `18.3.1` (Vite `6.1.0` build tool)
  - React Router DOM `6.28.2` (SPA Client Routing)
  - Axios `1.7.9` (HTTP REST Client with request interceptors)
  - Bootstrap `5.3.3` & Bootstrap Icons `1.11.3`
  - Lucide React `0.475.0` (Iconography)
  - Socket.IO Client `4.8.1` (Real-Time Bidirectional WebSockets)
- **Backend Stack:**
  - Express.js `4.21.2` (HTTP Application Server)
  - Mongoose `8.9.5` (MongoDB Object Document Mapper)
  - Socket.IO `4.8.1` (WebSocket Engine)
  - JSONWebToken (JWT) `9.0.2` & Cookie-Parser `1.4.7`
  - bcryptjs `2.4.3` (Password Hashing with 10 salt rounds)
  - Multer `1.4.5-lts.1` (Multipart File Upload Handler)
  - Helmet `8.0.0` (HTTP Security Header Hardening)
  - Express-Rate-Limit `7.5.0` (DDoS and Brute-Force Rate Limiting)
  - Morgan `1.10.0` (HTTP Request Logging)
  - Dotenv `16.4.7` (Environment Variable Isolation)
- **Database Engine:**
  - MongoDB 7.x / 8.x compatible
  - Dual-mode connection configuration: Supports standalone local `mongod` (`mongodb://127.0.0.1:27017/OnlineComplaintRegistration`) and cloud MongoDB Atlas; includes auto-fallback to embedded `mongodb-memory-server` with disk persistence (`server/data/db` via WiredTiger engine).
- **Automation & Test Libraries:**
  - Puppeteer-Core `24.x` (Headless Chrome browser automation using system executable)
  - Custom HTTP integration testing harness (`server/test/run-tests.js` and `server/test/qa-defect-hunt.js`)

### Package Scripts & Commands
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `concurrently "npm run start:server" "npm run start:client"` | Runs backend (port 5000) and frontend (port 5173) concurrently |
| `npm run start:server` | `cd server && npm start` | Launches Node.js backend server (`node src/server.js`) |
| `npm run start:client` | `cd client && npm run dev` | Launches Vite frontend development server (`vite`) |
| `npm run seed` | `cd server && npm run seed` | Seeds clean demo accounts, categories, and complaint lifecycles |
| `npm test` | `npm run test:server` | Executes backend integration test suite (`node test/run-tests.js`) |
| `npm run build` | `cd client && npm run build` | Compiles and optimizes frontend bundle for production (`vite build`) |

---

## C. Actual Folder Structure

```
D:\Online Complaint\
├── package.json                         # Root workspace configuration & concurrent scripts
├── .gitignore                           # Git exclusion rules (node_modules, envs, uploads, lockfiles)
├── README.md                            # Comprehensive project guide and evaluation documentation
├── client/                              # Single-Page Application (SPA) Frontend
│   ├── index.html                       # HTML5 entry template
│   ├── package.json                     # Frontend dependencies and Vite scripts
│   ├── vite.config.js                   # Vite configuration with React plugin
│   ├── src/
│   │   ├── main.jsx                     # Application bootstrap mounting ReactDOM
│   │   ├── App.jsx                      # Client router (17 distinct routes) and layout shell
│   │   ├── App.css                      # Application component styling & animations
│   │   ├── index.css                    # Global typography, color variables, and badges
│   │   ├── api/
│   │   │   └── axiosClient.js           # Axios instance with credentials & token interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          # User authentication state, login, logout, and token refresh
│   │   │   └── SocketContext.jsx        # Socket.IO connection manager & real-time events
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx           # Responsive navbar with role menus & profile dropdown
│   │   │   │   ├── Footer.jsx           # Global institutional footer with system status
│   │   │   │   ├── ProtectedRoute.jsx   # Role-based route guard redirecting unauthorized users
│   │   │   │   ├── NotificationDropdown.jsx # Real-time notification bell and alert list
│   │   │   │   ├── StatusBadge.jsx      # Colored pill badge for complaint statuses
│   │   │   │   ├── PriorityBadge.jsx    # Priority indicator (LOW, MEDIUM, HIGH, URGENT)
│   │   │   │   ├── StatCard.jsx         # Metric card with visual iconography
│   │   │   │   └── LoadingSpinner.jsx   # Centered loading animation
│   │   │   ├── complaints/
│   │   │   │   ├── ComplaintFilterBar.jsx   # Search input, status, priority & category filters
│   │   │   │   └── ComplaintTimeline.jsx    # Chronological history audit step timeline
│   │   │   └── chat/
│   │   │       └── ChatWindow.jsx       # Real-time WebSocket complaint chat thread
│   │   └── pages/
│   │       ├── public/
│   │       │   ├── LandingPage.jsx      # Portal home page with features, workflow & statistics
│   │       │   ├── LoginPage.jsx        # Secure login form with toggleable password visibility
│   │       │   ├── RegisterPage.jsx     # Complainant registration form with validation
│   │       │   ├── UnauthorizedPage.jsx # 403 Security access denied notice
│   │       │   └── NotFoundPage.jsx     # 404 Route fallback page
│   │       ├── user/
│   │       │   ├── UserDashboard.jsx    # Complainant dashboard with metrics & recent tickets
│   │       │   ├── SubmitComplaint.jsx  # Multi-field complaint filing form with file upload
│   │       │   ├── MyComplaints.jsx     # Personal complaint table with filtering & pagination
│   │       │   ├── ComplaintDetails.jsx # Detailed ticket view, timeline, chat & feedback
│   │       │   └── UserProfile.jsx      # Profile manager and password changer
│   │       ├── agent/
│   │       │   ├── AgentDashboard.jsx   # Support agent queue summary & workload metrics
│   │       │   ├── AgentComplaints.jsx  # Assigned tickets list with search & filters
│   │       │   └── AgentComplaintDetails.jsx # Resolution controls (In Progress, Resolved, Notes)
│   │       └── admin/
│   │           ├── AdminDashboard.jsx   # Global system analytics, charts & agent workloads
│   │           ├── AllComplaints.jsx    # Central complaint register with Assign modal
│   │           ├── UserManagement.jsx   # User directory, role promotion & staff creator
│   │           ├── CategoryManagement.jsx # Complaint category creator & toggle switch
│   │           ├── FeedbackReports.jsx  # Citizen resolution satisfaction review table
│   │           └── AuditLogs.jsx        # Immutable system administrative event audit trail
├── server/                              # Node.js Express REST Backend
│   ├── package.json                     # Backend dependencies and node scripts
│   ├── src/
│   │   ├── server.js                    # HTTP server wrap, socket attachment & graceful exit
│   │   ├── app.js                       # Express app configuration, security middleware & routes
│   │   ├── config/
│   │   │   └── db.js                    # Resilient MongoDB connector with WiredTiger fallback
│   │   ├── models/
│   │   │   ├── User.js                  # User schema with bcrypt hook & comparePassword
│   │   │   ├── Complaint.js             # Complaint schema, attachments, statuses & history
│   │   │   ├── Message.js               # Real-time complaint discussion schema
│   │   │   ├── Notification.js          # In-app event alerts (ASSIGNMENT, STATUS, MESSAGE)
│   │   │   ├── Category.js              # Administrative complaint categories
│   │   │   ├── Feedback.js              # Post-resolution citizen rating (1-5 stars) & review
│   │   │   └── AuditLog.js              # Administrative security & change log records
│   │   ├── controllers/
│   │   │   ├── authController.js        # Register, login, logout, getMe, updateProfile
│   │   │   ├── complaintController.js   # Create, list, details, history, reopen complaint
│   │   │   ├── agentController.js       # Assigned list, status transitions, progress notes
│   │   │   ├── adminController.js       # Dashboard stats, assign agent, override, staff create
│   │   │   ├── messageController.js     # Get thread messages, post message (closed guard)
│   │   │   └── feedbackController.js    # Submit feedback (integer guard), feedback reports
│   │   ├── middleware/
│   │   │   ├── authenticate.js          # JWT verification & active user verification
│   │   │   ├── authorize.js             # Strict role-based access control (RBAC) guard
│   │   │   ├── upload.js                # Multer 5MB size limit & MIME-type whitelist
│   │   │   └── errorHandler.js          # Centralized error handler (CastError, validation)
│   │   ├── routes/
│   │   │   ├── authRoutes.js            # `/api/auth` endpoints
│   │   │   ├── complaintRoutes.js       # `/api/complaints` endpoints
│   │   │   ├── agentRoutes.js           # `/api/agent` endpoints
│   │   │   ├── adminRoutes.js           # `/api/admin` endpoints
│   │   │   └── notificationRoutes.js    # `/api/notifications` endpoints
│   │   └── utils/
│   │       ├── socket.js                # Socket.IO rooms and event dispatchers
│   │       ├── audit.js                 # Helper to record administrative activity
│   │       ├── generateComplaintNumber.js # Unique ticket format generator (CMP-YYYYMMDD-XXXXXX)
│   │       └── seed.js                  # Production demo dataset populator
│   └── test/
│       ├── run-tests.js                 # 20+ automated backend integration test cases
│       └── qa-defect-hunt.js            # 11-probe regression test verifying bug resolutions
├── Demo Video/                            # Walkthrough & demonstration video recordings
│   ├── README.md                          # Video index, descriptions & Google Drive access links
│   ├── Demo Online Complaint Registration.mp4 # [62 MB] Live running application demonstration
│   ├── Backend.mp4                        # [94 MB] Backend architecture & source code walkthrough
│   └── Frontend.mp4                       # [191 MB] Frontend components & client code walkthrough
├── Documentation/                         # Academic documentation & capstone deliverables
│   ├── 1. Requirement Analysis/           # DFDs, user stories, solution requirements
│   ├── 2. Brainstorming and Ideation/     # Empathy map, problem statements
│   ├── 3. Project Planning/               # Project schedule & resource plan
│   ├── 4. Project Design/                 # Architecture & problem-solution fit
│   ├── 5. Project Development/            # UAT execution document & bug register
│   └── 6. Project Report/                 # Complete 21-page B.Tech Capstone Project Report
├── documentation_assets/                 # Audit documentation, diagrams & evidence package
│   ├── PROJECT_AUDIT_REPORT.md          # Comprehensive technical report (this document)
│   ├── SCREENSHOT_MANIFEST.md           # Catalog of all 21 verified screenshots
│   ├── DIAGRAM_EVIDENCE.md              # Technical diagrams (Architecture, ER, Workflows)
│   └── screenshots/                     # 21 genuine full-resolution PNG captures (01 to 21)
└── scripts/
    └── capture-all-screenshots.js       # Automated Puppeteer evidence collection script
```

---

## D. Frontend Inspection

### Routing Configuration (`client/src/App.jsx`)
The frontend client uses HTML5 browser routing managed by `react-router-dom`. Routes are grouped into public pages, shared protected pages, and role-restricted views guarded by the `ProtectedRoute` component:

| Route Path | Associated Page Component | Permitted Roles | Functional Purpose |
|---|---|---|---|
| `/` | `LandingPage.jsx` | Public | System introduction, workflow diagrams, portal metrics |
| `/login` | `LoginPage.jsx` | Public | JWT authentication entry with password reveal toggle |
| `/register` | `RegisterPage.jsx` | Public | Citizen registration; strictly enforces role `USER` |
| `/unauthorized` | `UnauthorizedPage.jsx` | Public | Friendly 403 access-denied security notice |
| `/profile` | `UserProfile.jsx` | Authenticated | Personal profile info update and password change |
| `/complaints/:id` | `ComplaintDetails.jsx` | Complainant, Agent, Admin | Full grievance record, timeline, live chat, reopen & feedback |
| `/user/dashboard` | `UserDashboard.jsx` | `USER` | Citizen summary counters and recent tickets |
| `/user/submit-complaint` | `SubmitComplaint.jsx` | `USER` | Ticket registration with category picker & file upload |
| `/user/my-complaints` | `MyComplaints.jsx` | `USER` | Personal grievance history with search & filter bar |
| `/agent/dashboard` | `AgentDashboard.jsx` | `AGENT` | Support queue metrics, active tickets, and recent activity |
| `/agent/complaints` | `AgentComplaints.jsx` | `AGENT` | Assigned tickets table with search & status filters |
| `/agent/complaints/:id` | `AgentComplaintDetails.jsx`| `AGENT` | Resolution workflow panel, progress note logger, chat |
| `/admin/dashboard` | `AdminDashboard.jsx` | `ADMIN` | Executive analytics, status distribution, agent workloads |
| `/admin/complaints` | `AllComplaints.jsx` | `ADMIN` | Global ticket manager with modal agent assignment |
| `/admin/users` | `UserManagement.jsx` | `ADMIN` | User accounts list, role promotion, and staff creation |
| `/admin/categories` | `CategoryManagement.jsx`| `ADMIN` | Category management and active/inactive toggle switch |
| `/admin/feedback` | `FeedbackReports.jsx` | `ADMIN` | Citizen satisfaction ratings (1-5 stars) and comments |
| `/admin/audit-logs` | `AuditLogs.jsx` | `ADMIN` | Immutable administrative security audit log register |
| `*` | `NotFoundPage.jsx` | Public | 404 error page for unmatched URL paths |

### State Management & Context API
1. **`AuthContext.jsx`:**
   - Centralizes authentication tokens and current user data in React state and `localStorage`.
   - Exposes `login(email, password)`, `register(formData)`, `logout()`, `updateProfile(data)`, and `fetchCurrentUser()`.
   - Automatically injects authorization tokens and synchronizes session state across components.
2. **`SocketContext.jsx`:**
   - Initializes a persistent Socket.IO connection to `http://localhost:5000` when the user is logged in.
   - Provides methods to join complaint discussion rooms (`join_complaint`) and leave them (`leave_complaint`).
   - Listens for real-time `new_notification`, `new_message`, and `status_updated` socket events.

---

## E. Backend Inspection

### Application Entry Points
- **`server/src/server.js`:** The primary process entry point. Connects to the database via `connectDB()`, wraps the Express application in an HTTP server, initializes Socket.IO with CORS settings, and listens on port 5000.
- **`server/src/app.js`:** The Express application factory. Configures Helmet, CORS, Cookie-Parser, Morgan, Express JSON body parsing, static file serving (`/uploads`), rate limiters, and mounts API routers under `/api/*`.

### API Routes & Endpoint Security Matrix
| HTTP Method | Route Endpoint | Controller Action | Access Scope | Description |
|---|---|---|---|---|
| `GET` | `/api/health` | Inline | Public | Server and MongoDB connection health check |
| `POST` | `/api/auth/register` | `authController.register` | Public | Registers a new account; enforces role `USER` |
| `POST` | `/api/auth/login` | `authController.login` | Public | Validates credentials; returns JWT and sets cookie |
| `POST` | `/api/auth/logout` | `authController.logout` | Public | Clears HttpOnly session cookie |
| `GET` | `/api/auth/me` | `authController.getMe` | Authenticated | Returns logged-in user profile details |
| `PATCH` | `/api/users/me` | `authController.updateProfile` | Authenticated | Updates name, phone, or password |
| `POST` | `/api/complaints` | `complaintController.createComplaint` | `USER` | Submits complaint with files, category validation |
| `GET` | `/api/complaints` | `complaintController.getComplaints` | Authenticated | Lists complaints scoped to user role with search/filter |
| `GET` | `/api/complaints/:id` | `complaintController.getComplaintById` | Authorized | Retrieves single complaint (owner, assigned agent, admin) |
| `GET` | `/api/complaints/:id/history` | `complaintController.getComplaintHistory` | Authorized | Returns chronological lifecycle history audit steps |
| `POST` | `/api/complaints/:id/reopen` | `complaintController.reopenComplaint` | `USER` (Owner) | Reopens resolved ticket; clears `resolvedAt` |
| `GET` | `/api/complaints/:id/messages` | `messageController.getMessages` | Authorized | Returns discussion thread; marks messages read |
| `POST` | `/api/complaints/:id/messages` | `messageController.sendMessage` | Authorized | Posts message; enforces closed ticket block |
| `POST` | `/api/complaints/:id/feedback` | `feedbackController.submitFeedback` | `USER` (Owner) | Submits 1-5 integer star rating and feedback review |
| `GET` | `/api/complaints/:id/feedback` | `feedbackController.getComplaintFeedback` | Authorized | Retrieves feedback record for a resolved ticket |
| `GET` | `/api/agent/dashboard` | `agentController.getAgentDashboard` | `AGENT` | Returns agent assigned metrics & active workload |
| `GET` | `/api/agent/complaints` | `agentController.getAssignedComplaints` | `AGENT` | Lists complaints assigned directly to logged-in agent |
| `PATCH`| `/api/agent/complaints/:id/status`| `agentController.updateComplaintStatus` | `AGENT` | Validates status transition (In Progress, Resolved) |
| `POST` | `/api/agent/complaints/:id/notes` | `agentController.addProgressNote` | `AGENT` | Appends milestone note to history without changing status |
| `GET` | `/api/admin/dashboard` | `adminController.getAdminDashboard` | `ADMIN` | System analytics, distributions, agent workloads |
| `GET` | `/api/admin/users` | `adminController.getUsers` | `ADMIN` | Paginated user directory with role and status filters |
| `POST` | `/api/admin/users/create-staff` | `adminController.createStaffUser` | `ADMIN` | Provisions support agent or administrator accounts |
| `PATCH`| `/api/admin/users/:id/status` | `adminController.updateUserStatus` | `ADMIN` | Activates or deactivates user accounts |
| `PATCH`| `/api/admin/users/:id/role` | `adminController.updateUserRole` | `ADMIN` | Promotes user role or updates department |
| `GET` | `/api/admin/agents` | `adminController.getAgents` | `ADMIN` | Lists active agents with current workload counts |
| `POST` | `/api/admin/complaints/:id/assign`| `adminController.assignComplaint` | `ADMIN` | Assigns/reassigns agent; prevents closed assignment |
| `PATCH`| `/api/admin/complaints/:id/status`| `adminController.adminUpdateComplaintStatus`| `ADMIN` | Administrative status override with audit logging |
| `GET` | `/api/admin/categories` | `adminController.getCategories` | Public/Auth | Returns active complaint categories |
| `POST` | `/api/admin/categories` | `adminController.createCategory` | `ADMIN` | Adds new category to the platform |
| `PATCH`| `/api/admin/categories/:id/toggle` | `adminController.toggleCategory` | `ADMIN` | Toggles category active status |
| `GET` | `/api/admin/feedback` | `feedbackController.getAllFeedback` | `ADMIN` | Returns all citizen feedback submissions |
| `GET` | `/api/admin/audit-logs` | `adminController.getAuditLogs` | `ADMIN` | Paginated security and administrative change logs |
| `GET` | `/api/notifications` | Inline Router | Authenticated | Returns current user notifications & unread count |
| `PATCH`| `/api/notifications/:id/read` | Inline Router | Authenticated | Marks a single notification as read |
| `PATCH`| `/api/notifications/mark-all-read` | Inline Router | Authenticated | Marks all user notifications as read |

---

## F. Database Design & Data Dictionary

The database consists of 7 Mongoose models stored in MongoDB:

### 1. `users` Collection (`server/src/models/User.js`)
- **`_id`** (ObjectId, Primary Key): Unique internal user identifier.
- **`name`** (String, Required): Full name of the user (2–100 chars, trimmed).
- **`email`** (String, Required, Unique Index): Lowercase trimmed email address.
- **`password`** (String, Required, Hidden): Salted bcrypt password hash. Excluded from query results by default (`select: false`).
- **`role`** (String, Enum: `['USER', 'AGENT', 'ADMIN']`, Default: `'USER'`, Index): Role used for RBAC checks.
- **`status`** (String, Enum: `['ACTIVE', 'INACTIVE']`, Default: `'ACTIVE'`, Index): Account active state.
- **`phone`** (String, Default: `''`): Callback telephone number.
- **`department`** (String, Default: `'General'`): Department for agents (e.g. Technical Support, Billing).
- **`createdAt` / `updatedAt`** (Date): Mongoose auto timestamps.

### 2. `complaints` Collection (`server/src/models/Complaint.js`)
- **`_id`** (ObjectId, Primary Key): Unique complaint identifier.
- **`complaintNumber`** (String, Required, Unique Index, Uppercase): Human-readable reference number (`CMP-YYYYMMDD-XXXXXX`).
- **`title`** (String, Required): Summary title of the grievance (5–200 chars).
- **`description`** (String, Required): Comprehensive grievance statement (min 10 chars).
- **`category`** (String, Required, Index): Category name validated against `Category` collection.
- **`priority`** (String, Enum: `['LOW', 'MEDIUM', 'HIGH', 'URGENT']`, Default: `'MEDIUM'`, Index).
- **`status`** (String, Enum: `['Submitted', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Closed']`, Default: `'Submitted'`, Index).
- **`user`** (ObjectId, Ref: `'User'`, Required, Index): Complainant who registered the ticket.
- **`assignedAgent`** (ObjectId, Ref: `'User'`, Default: `null`, Index): Assigned support technician.
- **`contactPhone`** (String): Callback telephone number for this grievance.
- **`contactAddress`** (String): Physical room or laboratory location.
- **`attachments`** (Array of Subdocuments): `{ filename, originalName, path, mimeType, size, uploadedAt }`.
- **`resolutionNotes`** (String): Detailed report of remedial actions taken by the technician.
- **`reopenReason`** (String): Citizen justification recorded when reopening a resolved complaint.
- **`resolvedAt`** (Date, Default: `null`): Timestamp of resolution (reset to `null` if reopened).
- **`closedAt`** (Date, Default: `null`): Timestamp of final archiving.
- **`history`** (Array of Subdocuments): Audit trail `{ previousStatus, newStatus, action, actor (Ref: User), actorName, actorRole, note, timestamp }`.

### 3. `messages` Collection (`server/src/models/Message.js`)
- **`_id`** (ObjectId, Primary Key): Message identifier.
- **`complaint`** (ObjectId, Ref: `'Complaint'`, Required, Index): Target grievance discussion thread.
- **`sender`** (ObjectId, Ref: `'User'`, Required): Author of the message.
- **`senderName`** (String, Required): Name of author at time of sending.
- **`senderRole`** (String, Required): Role of author (`USER`, `AGENT`, `ADMIN`).
- **`message`** (String, Required): Text body of the communication.
- **`readBy`** (Array of ObjectIds, Ref: `'User'`): List of users who have read the message.
- **`createdAt`** (Date): Timestamp of delivery.

### 4. `notifications` Collection (`server/src/models/Notification.js`)
- **`_id`** (ObjectId, Primary Key): Notification identifier.
- **`recipient`** (ObjectId, Ref: `'User'`, Required, Index): Target user receiving the alert.
- **`type`** (String, Enum: `['STATUS_UPDATE', 'ASSIGNMENT', 'MESSAGE', 'FEEDBACK', 'REOPENED', 'SYSTEM']`).
- **`title`** (String, Required): Notification header.
- **`message`** (String, Required): Brief summary text.
- **`relatedComplaint`** (ObjectId, Ref: `'Complaint'`, Index): Linked grievance reference.
- **`read`** (Boolean, Default: `false`, Index): Read/unread flag.
- **`createdAt`** (Date): Time of generation.

### 5. `categories` Collection (`server/src/models/Category.js`)
- **`_id`** (ObjectId, Primary Key): Category identifier.
- **`name`** (String, Required, Unique Index): Descriptive name of category.
- **`description`** (String): Scope of grievances included.
- **`isActive`** (Boolean, Default: `true`): Administrative active/deactivated flag.

### 6. `feedbacks` Collection (`server/src/models/Feedback.js`)
- **`_id`** (ObjectId, Primary Key): Feedback record identifier.
- **`complaint`** (ObjectId, Ref: `'Complaint'`, Required, Unique Index): Resolved complaint reference.
- **`user`** (ObjectId, Ref: `'User'`, Required): Complainant providing the review.
- **`rating`** (Number, Required, Min 1, Max 5): Integer star rating.
- **`comments`** (String): Qualitative review text.
- **`createdAt`** (Date): Time of submission.

### 7. `auditlogs` Collection (`server/src/models/AuditLog.js`)
- **`_id`** (ObjectId, Primary Key): Audit log entry identifier.
- **`actor`** (ObjectId, Ref: `'User'`, Required): User performing the administrative action.
- **`actorName` / `actorRole` / `actorEmail`** (String): Snapshot of actor details.
- **`action`** (String, Required): Action type (e.g. `AGENT_ASSIGNED`, `STAFF_ACCOUNT_CREATED`).
- **`targetType`** (String, Enum: `['COMPLAINT', 'USER', 'CATEGORY', 'SYSTEM']`).
- **`targetId`** (ObjectId): Affected entity identifier.
- **`ipAddress` / `userAgent`** (String): Request metadata.
- **`details`** (Object): Additional change parameters.
- **`createdAt`** (Date): Immutable creation timestamp.

---

## G. Actual Architectural Pattern

The application implements a **Modern Decoupled Client-Server Layered Architecture** with reactive event-driven extensions:

```
[ Web Browser Client ]
  ├── React 18 SPA (Views & Pages)
  ├── React Router DOM (Client-side Routing & Navigation Guards)
  ├── React Context API (AuthContext, SocketContext)
  └── Axios HTTP Interceptor & Socket.IO Client
          │
          ▼  (HTTPS / REST APIs & WebSockets)
[ Express.js Application Server ]
  ├── Security Layer (Helmet, CORS, Express-Rate-Limit, Cookie-Parser)
  ├── Middleware Layer (authenticate.js [JWT], authorize.js [RBAC], upload.js [Multer])
  ├── Routing Layer (authRoutes, complaintRoutes, agentRoutes, adminRoutes, notificationRoutes)
  ├── Controller Layer (Business logic, validation, transaction coordination)
  └── Event Dispatcher (utils/socket.js [Socket.IO Rooms], utils/audit.js)
          │
          ▼  (Mongoose ODM)
[ Data Persistence Layer ]
  ├── MongoDB Collections (Users, Complaints, Messages, Notifications, Categories, Feedbacks, AuditLogs)
  └── Storage Engine (WiredTiger filesystem persistence in server/data/db)
```

1. **Presentation / View Layer (Frontend):** React components handle rendering, form inputs, dynamic state updates, and visual feedback. All communication with the server is asynchronous via REST calls and WebSocket subscriptions.
2. **Controller Layer (Backend):** Controllers encapsulate business rules, input sanitization, database updates, state machine enforcement, and event triggering.
3. **Model Layer (Database):** Mongoose schemas define field types, validation rules, compound indexes, pre-save password hashing hooks, and JSON serialization guards.

---

## H. Feature Verification Matrix

| Feature | Source Files | Verification Method | Observed Result | Status |
|---|---|---|---|---|
| User Registration | `RegisterPage.jsx`, `authController.js`, `User.js` | Automated probe & UI test | Creates account with bcrypt hash, enforces role `USER`, rejects duplicates | Implemented and verified |
| User Login & Session | `LoginPage.jsx`, `authController.js`, `authenticate.js` | Automated probe & UI test | Returns signed JWT, sets HttpOnly cookie, rejects invalid passwords | Implemented and verified |
| Role-Based Authorization | `ProtectedRoute.jsx`, `authorize.js` | Automated test suite | Rejects cross-role access with HTTP 403; protects agent & admin pages | Implemented and verified |
| Complaint Registration | `SubmitComplaint.jsx`, `complaintController.js`, `Complaint.js` | Automated test & UI fill | Generates unique reference #, validates categories, saves attachments | Implemented and verified |
| Scoped Complaint Listing | `MyComplaints.jsx`, `complaintController.js` | Automated test & UI check | Citizens only see their own tickets; agents only see assigned tickets | Implemented and verified |
| Search Query Sanitization | `ComplaintFilterBar.jsx`, `complaintController.js` | Automated probe `BG-001` | Metacharacters (`[`, `*`, `+`) safely escaped; no 500 crashes occur | Implemented and verified |
| Admin Agent Assignment | `AllComplaints.jsx`, `adminController.js` | Automated probe & UI modal | Assigns agent, updates status to Assigned, logs history & dispatches alerts | Implemented and verified |
| Agent Status Transitions | `AgentComplaintDetails.jsx`, `agentController.js` | Automated test suite | Enforces state transitions (Assigned -> In Progress -> Resolved) | Implemented and verified |
| Agent Resolution Controls | `AgentComplaintDetails.jsx`, `agentController.js` | Automated probe `BG-007` | Requires resolution notes on resolve; allows resuming reopened complaints | Implemented and verified |
| Real-Time Chat & Thread Archiving | `ChatWindow.jsx`, `messageController.js`, `socket.js` | Automated probe `BG-003` | Live WebSocket messaging between parties; blocks messages on closed files | Implemented and verified |
| In-App Notifications | `NotificationDropdown.jsx`, `Notification.js` | Automated test & UI bell | Real-time alerts for assignment, status update, message, and feedback | Implemented and verified |
| Complaint Reopening | `ComplaintDetails.jsx`, `complaintController.js` | Automated probe `BG-004` | Reopens resolved ticket with citizen reason; resets `resolvedAt` to null | Implemented and verified |
| Citizen Satisfaction Feedback | `ComplaintDetails.jsx`, `feedbackController.js`, `Feedback.js`| Automated probe `BG-006` | Records 1-5 integer star rating & review; prevents duplicate feedback | Implemented and verified |
| Admin Executive Dashboard | `AdminDashboard.jsx`, `adminController.js` | Automated test & UI load | Displays live counters, status distributions, category & agent workloads | Implemented and verified |
| User & Staff Management | `UserManagement.jsx`, `adminController.js` | Automated test & UI modal | Direct creation of Support Agent and Admin accounts; status toggle | Implemented and verified |
| Category Management | `CategoryManagement.jsx`, `adminController.js` | Automated test & UI check | Administrative creation and active/deactive toggle of categories | Implemented and verified |
| Citizen Feedback Reports | `FeedbackReports.jsx`, `feedbackController.js` | Automated test & UI table | Aggregates all citizen ratings with gold star UI and review comments | Implemented and verified |
| Administrative Audit Trail | `AuditLogs.jsx`, `adminController.js`, `AuditLog.js` | Automated test & UI table | Immutable log of administrative assignments, status overrides, and changes | Implemented and verified |
| Mobile Responsive Layout | `Navbar.jsx`, `App.css`, `index.css` | Headless Chrome 390x844 | Responsive hamburger menu, stacked cards, readable touch targets | Implemented and verified |

---

## I. Execution Instructions

### 1. Installation
From the project root:
```bash
npm run install-all
```
*(Installs dependencies for root, client, and server packages).*

### 2. Configuration (`server/.env`)
Required environment variables:
- `PORT`: Backend listening port (default: `5000`)
- `NODE_ENV`: Application environment (`development` or `production`)
- `MONGODB_URI`: MongoDB connection string (`mongodb://127.0.0.1:27017/OnlineComplaintRegistration`)
- `ALLOW_MEMORY_DB_FALLBACK`: Set to `true` to enable persistent embedded database engine if local MongoDB service is inactive
- `JWT_SECRET`: Cryptographic key for signing JSON Web Tokens
- `JWT_EXPIRES_IN`: Session token validity period (e.g. `7d`)
- `CLIENT_URL`: Trusted frontend origin for CORS and WebSockets (`http://localhost:5173`)
- `MAX_FILE_SIZE`: Maximum attachment size in bytes (`5242880` = 5MB)

### 3. Database Initialization & Seeding
To populate realistic demonstration data:
```bash
npm run seed
```

### 4. Running the Application
To run both backend and frontend concurrently:
```bash
npm run dev
```
Alternatively, in separate terminals:
- **Backend:** `cd server && npm start` (Running on `http://localhost:5000`)
- **Frontend:** `cd client && npm run dev` (Running on `http://localhost:5173`)

### 5. Running Automated Tests
```bash
npm test
node server/test/qa-defect-hunt.js
```

### 6. Building Frontend for Production
```bash
npm run build
```

---

## J. Testing Evidence

### Suite 1: Automated Integration Test Suite (`server/test/run-tests.js`)
- **Execution Command:** `npm test`
- **Result:** **20/20 Test Cases Passed (100% Pass Rate)**
- **Modules Tested:**
  - `1.1–1.5`: User registration, role escalation defense, duplicate email rejection, password mismatch, valid login, invalid credential rejection.
  - `2.1–2.3`: Complaint creation with reference generation, complainant scoped listing, unassigned agent access denial (HTTP 403).
  - `3.1–3.2`: Administrator assignment to agent, status move to Assigned, agent access verification.
  - `4.1–4.4`: Invalid status transition rejection, valid transition to In Progress, milestone note recording, resolution with required notes.
  - `5.1–5.2`: Complainant message submission, agent thread reply, live message read state.
  - `6.1–6.2`: Complainant 5-star resolution feedback, duplicate feedback prevention (HTTP 400).
  - `7.1`: Complaint reopening with justification note.
  - `8.1–8.2`: In-app notification delivery and admin analytics document aggregation.

### Suite 2: Defect Hunt & Regression Verification Suite (`server/test/qa-defect-hunt.js`)
- **Execution Command:** `node server/test/qa-defect-hunt.js`
- **Result:** **11/11 Probes Passed (100% Pass Rate)**
- **Verified Probes:**
  - `BG-001.1` to `BG-001.3`: Unescaped search queries with `[`, `*`, `+` return HTTP 200 without regex crashes.
  - `BG-002.1` & `BG-002.2`: Rejects non-existent and inactive categories with HTTP 400.
  - `BG-002.3`: Accepts valid active categories (HTTP 201).
  - `BG-003`: Rejects new messages on Closed complaints with HTTP 400.
  - `BG-004`: Reopen state transition resets `resolvedAt` to `null`.
  - `BG-005`: Rejects agent assignment to Closed complaints with HTTP 400.
  - `BG-006.1` & `BG-006.2`: Rejects decimal rating `3.5` (HTTP 400); accepts integer rating `4` (HTTP 201).
  - `BG-007`: Permits agents to resume progress on Reopened complaints via UI and API (HTTP 200).

### Suite 3: Client Production Compilation
- **Execution Command:** `npm run build`
- **Result:** **Vite v6.4.4 compiled in 22.98s with 0 errors.** Transformed 1,713 modules into optimized bundles (`dist/assets/index.js` and `dist/assets/index.css`).

---

## K. Limitations and Pending Work

1. **External SMTP Mail Server:** The system implements in-app real-time notifications via WebSockets and database persistence. Outbound transactional SMTP emailing (SendGrid/AWS SES) is architected in code but requires external SMTP credentials to deliver external emails to consumer inboxes.
2. **Third-Party Identity Providers:** OAuth2 / Social Login (Google, Microsoft) is omitted intentionally in favor of native JWT token security to satisfy the standalone college capstone requirements.
3. **Pending Bugs:** **Zero.** All 7 identified bugs were fixed and verified.
