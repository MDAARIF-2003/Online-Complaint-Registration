# Online Complaint Registration and Management System (GrievanceHub)
> A centralized, secure full-stack MERN (MongoDB, Express, React, Node.js) grievance redressal and workflow management platform with role-based access control, real-time lifecycle tracking, secure messaging, staff load balancing, and administrative management.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new)

### 🚀 Quick Launch Links
- **Localhost Frontend (Web Portal):** [http://localhost:5173](http://localhost:5173) *(Open in browser when running)*
- **Localhost Backend API Health:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **1-Click Cloud Run:** Click the **Open in GitHub Codespaces** badge above to launch and run directly in your browser with zero manual setup.

---

## 1. System Architecture & Workflows

The **Online Complaint Registration and Management System** connects three distinct user roles in an organization:
1. **Citizen / Customer (Complainant)**: Registers complaints with evidence attachments, receives unique reference numbers (`CMP-YYYYMMDD-XXXXXX`), tracks chronological progress milestones, communicates with assigned agents via real-time messaging, and submits satisfaction feedback upon resolution.
2. **Support Agent**: Handles specialized queues by department, executes strictly validated status transitions (e.g. *Assigned &rarr; In Progress &rarr; Resolved*), appends internal progress notes, and communicates directly with complainants.
3. **Administrator**: Oversees the entire redressal lifecycle, dynamically allocates complaints to balance agent workloads, manages user and staff accounts, manages categories, inspects satisfaction feedback, and reviews the cryptographic audit log.

```
                              +----------------------------+
                              |   React Frontend (Vite)    |
                              | Bootstrap 5 + Lucide Icons |
                              +--------------+-------------+
                                             |
                                  REST APIs  |  Socket.IO
                                             |
                              +--------------v-------------+
                              |    Node.js / Express API   |
                              | JWT Auth, Helmet, CORS,    |
                              | Multer, Rate Limiting      |
                              +--------------+-------------+
                                             |
                                             v
                              +----------------------------+
                              |      MongoDB Database      |
                              | Mongoose Schemas & Indexes |
                              | (Local, Atlas, or Server)  |
                              +----------------------------+
```

---

## 2. Technology Stack

- **Frontend**: React 18, React Router DOM v6, Axios, Bootstrap 5, Bootstrap Icons, Lucide React, Socket.IO Client.
- **Backend**: Node.js, Express.js, Mongoose, Socket.IO, Multer, Helmet, CORS, Express Rate Limit, Cookie Parser, Morgan.
- **Database**: MongoDB (Supports standard local instance `mongodb://127.0.0.1:27017`, MongoDB Atlas, or persistent local WiredTiger storage).
- **Security**: bcryptjs password hashing (10 salt rounds), JWT authentication, role-based middleware, file upload MIME verification, request sanitization, and audit trails.

---

## 3. Standard System Accounts

The database contains the following active user and staff accounts:

| Role | Name | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | System Administrator | `admin@complaintportal.com` | `Admin@12345` | System Admin |
| **Support Agent** | Sarah Jenkins | `agent.sarah@complaintportal.com` | `Agent@12345` | Technical Support |
| **Support Agent** | Rajesh Kumar | `agent.rajesh@complaintportal.com` | `Agent@12345` | Billing & Accounts |
| **Support Agent** | Emily Watson | `agent.emily@complaintportal.com` | `Agent@12345` | Facilities & Operations |
| **Citizen / User** | Priya Sharma | `user.priya@complaintportal.com` | `User@12345` | Complainant |
| **Citizen / User** | Alex Martinez | `user.alex@complaintportal.com` | `User@12345` | Complainant |

> *Note: Administrators can also create new staff and agent accounts directly from the **User Management** panel in the application.*

---

## 4. Quick Start & Execution Guide

### Prerequisites
- Node.js (v18 or newer; v20/v24 recommended)
- npm (v9 or newer)

### 1. Install Dependencies
Run the following command from the project root:
```bash
npm run install-all
```

### 2. Configure Environment Variables
- `server/.env` (pre-created from `server/.env.example`):
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://127.0.0.1:27017/OnlineComplaintRegistration
  ALLOW_MEMORY_DB_FALLBACK=true
  JWT_SECRET=super_secret_jwt_key_complaint_portal_2026_academic_project
  JWT_EXPIRES_IN=7d
  CLIENT_URL=http://localhost:5173
  MAX_FILE_SIZE=5242880
  ```
- `client/.env` (pre-created from `client/.env.example`):
  ```env
  VITE_API_URL=http://localhost:5000/api
  VITE_SOCKET_URL=http://localhost:5000
  ```

### 3. Initialize / Seed Database
To populate or reset default categories, users, complaints, and audit records:
```bash
npm run seed
```

### 4. Run the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```
Or start them individually:
```bash
# Terminal 1: Backend (Port 5000)
npm run start:server

# Terminal 2: Frontend (Port 5173)
npm run start:client
```
Open **`http://localhost:5173`** in your browser.

---

## 5. Automated Integration Test Suite

Execute the test suite verifying all 20+ operations (Auth, Permissions, Transitions, Uploads, Chat, Feedback, Audit Logs):
```bash
npm test
```

---

## 6. REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new citizen account (strictly forces role `USER`).
- `POST /api/auth/login` - Authenticate user, issue JWT token & cookie.
- `POST /api/auth/logout` - Clear authentication token.
- `GET /api/auth/me` - Fetch authenticated user profile.
- `PATCH /api/users/me` - Update personal profile or change password.

### Complaints (`/api/complaints`)
- `POST /api/complaints` - Submit a new grievance (supports multipart file uploads).
- `GET /api/complaints` - List complaints (scoped by role with search, status, priority, category filters, pagination).
- `GET /api/complaints/:id` - Fetch detailed complaint file with history and agent details.
- `GET /api/complaints/:id/history` - Fetch chronological audit trail.
- `POST /api/complaints/:id/reopen` - Reopen a resolved grievance with a mandatory reason.
- `GET /api/complaints/:id/messages` - Retrieve conversation messages.
- `POST /api/complaints/:id/messages` - Send a message on the complaint thread.
- `POST /api/complaints/:id/feedback` - Submit 1-5 star rating & review for resolved complaint.
- `GET /api/complaints/:id/feedback` - Retrieve complaint feedback.

### Agent Operations (`/api/agent`)
- `GET /api/agent/dashboard` - Agent dashboard statistics and assigned queue metrics.
- `GET /api/agent/complaints` - Filterable assigned queue for logged-in specialist.
- `PATCH /api/agent/complaints/:id/status` - Execute valid status transition (*In Progress*, *Resolved*).
- `POST /api/agent/complaints/:id/notes` - Append progress milestone note.

### Administrative Operations (`/api/admin`)
- `GET /api/admin/dashboard` - Comprehensive analytics, workload monitor, priority breakdown.
- `GET /api/admin/users` - Directory of registered citizens and staff.
- `POST /api/admin/users/create-staff` - Create new support agent or admin account.
- `GET /api/admin/agents` - List of active agents with live workload counts.
- `POST /api/admin/complaints/:id/assign` - Assign or reassign complaint to an agent.
- `PATCH /api/admin/complaints/:id/status` - Manual status override with audit logging.
- `PATCH /api/admin/users/:id/status` - Toggle account status (`ACTIVE` / `INACTIVE`).
- `PATCH /api/admin/users/:id/role` - Promote user role or update department.
- `GET /api/admin/categories` - List grievance categories.
- `POST /api/admin/categories` - Create new complaint category.
- `PATCH /api/admin/categories/:id/toggle` - Activate / deactivate category.
- `GET /api/admin/feedback` - List citizen satisfaction reviews.
- `GET /api/admin/audit-logs` - Paginated immutable audit trail.

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` - Retrieve recent in-app notifications and unread count.
- `PATCH /api/notifications/:id/read` - Mark single notification as read.
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read.
