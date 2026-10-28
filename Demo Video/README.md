# 🎥 Demo & Code Walkthrough Videos
### *Online Complaint Registration & Management System (GrievanceHub)*

[![Google Drive](https://img.shields.io/badge/Google%20Drive-Watch%20%26%20Download%20Videos-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1jERMEGYjqmVyDHKZ71rKk3lFKDH_hAet?usp=drive_link)

This folder catalogs the official high-definition demonstration and source code walkthrough videos for the **Online Complaint Registration & Management System**.

---

## 📹 Video Catalogue

| Video Name | Format | Reduced Size | Description | Google Drive Access |
| :--- | :---: | :---: | :--- | :---: |
| **`Demo Online Complaint Registration.mp4`** | MP4 | `62 MB` | **Live Application Demonstration:** End-to-end user workflows including citizen registration, grievance submission with attachments, agent ticket assignment, live status transitions, real-time WebSocket chat, and administrative analytics. | [🎬 Watch / Download](https://drive.google.com/drive/folders/1jERMEGYjqmVyDHKZ71rKk3lFKDH_hAet?usp=drive_link) |
| **`Frontend.mp4`** | MP4 | `191 MB` | **Frontend Codebase Walkthrough:** Detailed inspection of React 18 single-page application structure, 17 client routes, Tailwind styling, `AuthContext`, `SocketContext`, reusable UI components, and API service integration. | [🎬 Watch / Download](https://drive.google.com/drive/folders/1jERMEGYjqmVyDHKZ71rKk3lFKDH_hAet?usp=drive_link) |
| **`Backend.mp4`** | MP4 | `94 MB` | **Backend Codebase Walkthrough:** Comprehensive tour of Node.js & Express architecture, Mongoose schemas (`Complaint.js`, `User.js`, `Message.js`), JWT authentication middleware, REST API controllers, and database seeding. | [🎬 Watch / Download](https://drive.google.com/drive/folders/1jERMEGYjqmVyDHKZ71rKk3lFKDH_hAet?usp=drive_link) |

---

## 📁 Source Code Modules Covered in Walkthroughs

### 1. Frontend Code Files (`Frontend.mp4`)
* **Routing & Layout:** `client/src/App.jsx`, `client/src/main.jsx`
* **State Management:** `client/src/context/AuthContext.jsx`, `client/src/context/SocketContext.jsx`
* **Citizen Pages:** `client/src/pages/user/UserDashboard.jsx`, `CreateComplaint.jsx`, `MyComplaints.jsx`, `ComplaintDetails.jsx`
* **Agent Pages:** `client/src/pages/agent/AgentDashboard.jsx`, `AgentComplaints.jsx`, `AgentComplaintDetails.jsx`
* **Admin Pages:** `client/src/pages/admin/AdminDashboard.jsx`, `AdminComplaints.jsx`, `UserManagement.jsx`, `AgentManagement.jsx`
* **Real-Time Components:** `client/src/components/chat/ChatWindow.jsx`, `NotificationDropdown.jsx`

### 2. Backend Code Files (`Backend.mp4`)
* **Entry Point & Server:** `server/src/server.js`, `server/src/app.js`
* **Database & Seed:** `server/src/config/db.js`, `server/src/utils/seed.js`
* **Mongoose Models:** `server/src/models/Complaint.js`, `User.js`, `Message.js`, `Category.js`, `Feedback.js`, `AuditLog.js`
* **Controllers:** `complaintController.js`, `authController.js`, `agentController.js`, `adminController.js`, `messageController.js`
* **Security Middleware:** `authenticate.js`, `authorize.js`, `validate.js`, `upload.js`, `rateLimiter.js`

---

## ☁️ Cloud Storage Access Note
Due to standard Git repository size optimization best practices, large video binaries are permanently hosted and streamed via our secure **Google Drive Shared Folder**:

👉 **[Access Google Drive Videos & Academic Documentation](https://drive.google.com/drive/folders/1jERMEGYjqmVyDHKZ71rKk3lFKDH_hAet?usp=drive_link)**
