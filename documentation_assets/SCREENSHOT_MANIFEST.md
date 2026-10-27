# System Screenshot Manifest & Image Index
# Online Complaint Registration and Management System (*GrievanceHub*)

**Author / Project Lead:** MD AARIF IDRASI  
**Document Target:** Image catalog and placement guide for the 21-page academic project report  
**Capture Method:** Automated headless Chrome browser capture via Puppeteer-Core  
**Base Viewport:** 1440 × 900 pixels (Desktop) | 390 × 844 pixels (Mobile)  
**Total Screenshots Captured:** 21 PNG files in `documentation_assets/screenshots/`  

---

## 1. Complete Screenshot Inventory Table

| # | Exact Filename | Screen Title | Route / URL Path | Role Used | Demonstrated Capability | Verification Status | Recommended Report Section |
|---|---|---|---|---|---|---|---|
| **01** | `01_landing_page.png` | Landing / Home Page | `/` | Public | System introduction, quick statistics, core features, and architectural overview | Verified (1440x900) | Section 1: Introduction / System Overview |
| **02** | `02_user_registration.png` | User Registration Page | `/register` | Public | Complainant account creation form with validation fields (Name, Email, Phone, Password) | Verified (1440x900) | Section 4: Authentication & Security |
| **03** | `03_user_login.png` | User Login Page | `/login` | Public | Secure JWT credential authentication with toggleable password visibility | Verified (1440x900) | Section 4: Authentication & Security |
| **04** | `04_user_dashboard.png` | Ordinary User Dashboard | `/user/dashboard` | `USER` (Priya) | Complainant welcome banner, summary KPI cards (Total, In Progress, Resolved), recent tickets | Verified (1440x900) | Section 5: Complainant Module |
| **05** | `05_complaint_submission.png` | Complaint Registration Form | `/user/submit-complaint` | `USER` (Priya) | Multi-field grievance filing form with title, priority, category picker, and location details | Verified (1440x900) | Section 5: Complainant Module |
| **06** | `06_my_complaints.png` | My Complaints Listing | `/user/my-complaints` | `USER` (Priya) | Tabular grievance history with reference #, category, priority badge, and status pill | Verified (1440x900) | Section 5: Complainant Module |
| **07** | `07_complaint_details_history.png` | Complaint Details & History | `/complaints/:id` | `USER` (Priya) | Comprehensive grievance card, complainant statement, location, and audit timeline | Verified (1440x900) | Section 5: Complainant Module |
| **08** | `08_complaint_messaging.png` | Live Complaint Chat Thread | `/complaints/:id` | `USER` (Priya) | Real-time WebSocket communication thread between complainant and assigned support agent | Verified (1440x900) | Section 7: Communication System |
| **09** | `09_notifications.png` | Notifications Interface | `/user/dashboard` | `USER` (Priya) | In-app notification bell dropdown showing real-time alerts for assignments and messages | Verified (1440x900) | Section 7: Communication System |
| **10** | `10_user_profile.png` | User Profile Management | `/profile` | `USER` (Priya) | Profile card displaying user role, contact information, and password change utility | Verified (1440x900) | Section 4: User Profile & Account |
| **11** | `11_agent_dashboard.png` | Support Agent Dashboard | `/agent/dashboard` | `AGENT` (Sarah) | Support queue overview, assigned workload KPIs (In Progress, Resolved, Pending), active tickets | Verified (1440x900) | Section 6: Support Agent Module |
| **12** | `12_agent_complaint_details.png` | Agent Action & Status Controls | `/agent/complaints/:id` | `AGENT` (Sarah) | Agent resolution panel (Start Progress, Mark as Resolved, Add Progress Note) and live chat | Verified (1440x900) | Section 6: Support Agent Module |
| **13** | `13_admin_dashboard.png` | Administrator Executive Dashboard | `/admin/dashboard` | `ADMIN` (Admin) | Global analytics, resolution rate, status distribution, category breakdown, agent workloads | Verified (1440x900) | Section 8: Administrator Module |
| **14** | `14_admin_complaints.png` | Administrator Complaint Register | `/admin/complaints` | `ADMIN` (Admin) | Central complaint management table with multi-parameter filter bar and action controls | Verified (1440x900) | Section 8: Administrator Module |
| **15** | `15_complaint_assignment.png` | Complaint Assignment Modal | `/admin/complaints` | `ADMIN` (Admin) | Modal overlay displaying available support agents with current workloads for assignment | Verified (1440x900) | Section 8: Administrator Module |
| **16** | `16_user_management.png` | User Directory & Staff Provisioning | `/admin/users` | `ADMIN` (Admin) | User accounts list with role badges (USER, AGENT, ADMIN), status toggle, and staff creator | Verified (1440x900) | Section 8: Administrator Module |
| **17** | `17_agent_management.png` | Category Management Interface | `/admin/categories` | `ADMIN` (Admin) | Grievance category creation form and active/deactive status switch controls | Verified (1440x900) | Section 8: Administrator Module |
| **18** | `18_feedback_rating.png` | Complaint Feedback & Rating Card | `/complaints/:id` | `USER` (Alex) | Post-resolution citizen satisfaction card with 5-star rating, review, and resolution summary | Verified (1440x900) | Section 9: Quality & Feedback |
| **19** | `19_admin_reports.png` | Citizen Feedback Review Report | `/admin/feedback` | `ADMIN` (Admin) | Central feedback audit table aggregating citizen reviews, satisfaction stars, and dates | Verified (1440x900) | Section 9: Quality & Feedback |
| **20** | `20_validation_or_access_denied.png` | Security 403 Access Denied | `/unauthorized` | Public / Restrict | Visual security shield informing unauthorized users of role-based access restrictions | Verified (1440x900) | Section 4: Security Architecture |
| **21** | `21_mobile_responsive.png` | Mobile Responsive View | `/` | Mobile (390x844) | Mobile-optimized layout with collapsible hamburger navbar, stacked cards, and touch buttons | Verified (390x844) | Section 10: Responsive UI/UX |

---

## 2. Screenshots Grouped by Operational Role

### Group A: Public & Authentication Screens
- **`01_landing_page.png`:** Institutional landing page showcasing key features and workflow.
- **`02_user_registration.png`:** Complainant sign-up page verifying field validation.
- **`03_user_login.png`:** Secure sign-in page with credential inputs.
- **`20_validation_or_access_denied.png`:** Defensive security page preventing unauthorized URL traversal.

### Group B: Complainant / Citizen Module Screens
- **`04_user_dashboard.png`:** Personalized dashboard with live summary counters.
- **`05_complaint_submission.png`:** Interactive grievance submission form with category dropdown.
- **`06_my_complaints.png`:** Scoped list of complaints submitted by the logged-in citizen.
- **`07_complaint_details_history.png`:** Full grievance audit view with reverse chronological history.
- **`08_complaint_messaging.png`:** WebSocket conversation thread with the assigned technician.
- **`09_notifications.png`:** Notification bell dropdown showing event alerts.
- **`10_user_profile.png`:** Profile card showing account details and password change form.
- **`18_feedback_rating.png`:** Star rating (1-5) and feedback submission on resolved complaints.

### Group C: Support Agent Module Screens
- **`11_agent_dashboard.png`:** Agent operational queue, workload distribution, and ticket counters.
- **`12_agent_complaint_details.png`:** Technician diagnostic controls, resolution logger, and chat window.

### Group D: Administrator Module Screens
- **`13_admin_dashboard.png`:** Executive analytics dashboard with dynamic aggregations.
- **`14_admin_complaints.png`:** Master complaint register with search, category, and status filters.
- **`15_complaint_assignment.png`:** Modal dialog for assigning complaints to support agents.
- **`16_user_management.png`:** User administration table with role promotion and staff creation modal.
- **`17_agent_management.png`:** Category management panel for adding and toggling categories.
- **`19_admin_reports.png`:** Citizen feedback reports summarizing satisfaction ratings.

### Group E: Mobile & Responsive Layout
- **`21_mobile_responsive.png`:** Complete smartphone viewport (390 × 844 px) demonstrating responsive layout.

---

## 3. Placement Recommendations for the 21-Page Project Report

| Report Section | Suggested Screenshot(s) | Figure Caption in Final Report |
|---|---|---|
| **Chapter 1: Introduction** | `01_landing_page.png` | *Figure 1.1: GrievanceHub Web Portal Home Interface* |
| **Chapter 3: System Design & Security** | `02_user_registration.png`, `03_user_login.png`, `20_validation_or_access_denied.png` | *Figure 3.1: Complainant Registration; Figure 3.2: Secure Login; Figure 3.3: 403 Role Guard* |
| **Chapter 4: Complainant Module** | `04_user_dashboard.png`, `05_complaint_submission.png`, `06_my_complaints.png` | *Figure 4.1: Citizen Dashboard; Figure 4.2: Complaint Filing; Figure 4.3: My Complaints Queue* |
| **Chapter 5: Tracking & Auditing** | `07_complaint_details_history.png` | *Figure 5.1: Grievance Audit History and Lifecycle Trail* |
| **Chapter 6: Communication System** | `08_complaint_messaging.png`, `09_notifications.png` | *Figure 6.1: Live WebSocket Thread; Figure 6.2: In-App Notification Bell* |
| **Chapter 7: Support Agent Operations** | `11_agent_dashboard.png`, `12_agent_complaint_details.png` | *Figure 7.1: Support Queue; Figure 7.2: Agent Resolution Workflow Controls* |
| **Chapter 8: Administration & Governance**| `13_admin_dashboard.png`, `14_admin_complaints.png`, `15_complaint_assignment.png`, `16_user_management.png` | *Figure 8.1: Executive Analytics; Figure 8.2: Complaint Master List; Figure 8.3: Agent Assignment; Figure 8.4: User Directory* |
| **Chapter 9: Quality & Citizen Feedback** | `18_feedback_rating.png`, `19_admin_reports.png` | *Figure 9.1: Citizen Rating Card; Figure 9.2: Administrative Review Reports* |
| **Chapter 10: Responsive Implementation** | `21_mobile_responsive.png` | *Figure 10.1: Mobile Responsive Layout (iPhone 14 Viewport)* |
