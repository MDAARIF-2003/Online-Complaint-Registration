# System Architectural & Workflow Diagram Evidence
# Online Complaint Registration and Management System (*GrievanceHub*)

**Author / Project Lead:** MD AARIF IDRASI  
**Document Purpose:** Grounded architectural specifications, entity relationships, and workflow diagrams for direct inclusion in the 21-page academic project report.  
**Diagram Format:** Mermaid diagram code blocks and textual relationship specifications verified against the implemented codebase.  

---

## 1. Technical Architecture Diagram

The system employs a 3-tier MERN (MongoDB, Express, React, Node) architecture augmented with Socket.IO for real-time bidirectional communication and Multer for multipart file storage.

```mermaid
flowchart TD
    subgraph ClientTier ["Frontend Presentation Tier (Client)"]
        UI["React 18 SPA (Vite)"]
        Router["React Router DOM (Client Routing)"]
        AuthCtx["Auth Context (JWT State & Session)"]
        SocketCtx["Socket Context (WebSocket Client)"]
        AxiosClient["Axios HTTP Client (Interceptors)"]
        UI --> Router
        Router --> AuthCtx
        Router --> SocketCtx
        AuthCtx --> AxiosClient
    end

    subgraph ServerTier ["Application Tier (Node.js & Express.js)"]
        HTTP["HTTP Server / Express App (Port 5000)"]
        Security["Security Layer: Helmet, CORS, RateLimit"]
        AuthMiddleware["authenticate.js (JWT Verification)"]
        RBACMiddleware["authorize.js (Role Authorization)"]
        UploadMiddleware["upload.js (Multer 5MB File Filter)"]
        Controllers["Controllers: Auth, Complaint, Agent, Admin, Message, Feedback"]
        SocketServer["Socket.IO Server (Real-time Rooms)"]
        
        HTTP --> Security
        Security --> AuthMiddleware
        AuthMiddleware --> RBACMiddleware
        RBACMiddleware --> Controllers
        Security --> UploadMiddleware
        UploadMiddleware --> Controllers
        HTTP --> SocketServer
    end

    subgraph DataTier ["Data & Persistence Tier"]
        MongooseODM["Mongoose ODM (Schema & Indexes)"]
        MongoDB[("MongoDB Database Engine")]
        DiskStorage["Local Disk Storage (server/uploads)"]
        
        Controllers --> MongooseODM
        MongooseODM --> MongoDB
        UploadMiddleware --> DiskStorage
    end

    AxiosClient -->|"REST APIs (JSON / HTTPS)"| HTTP
    SocketCtx <-->|"WebSocket Bidirectional Events"| SocketServer
```

---

## 2. Entity-Relationship (ER) Diagram

All entities, relationships, foreign keys, and cardinalities below are derived directly from the Mongoose schemas in `server/src/models/`:

```mermaid
erDiagram
    USER ||--o{ COMPLAINT : "submits (user)"
    USER ||--o{ COMPLAINT : "assigned to (assignedAgent)"
    USER ||--o{ MESSAGE : "sends (sender)"
    USER ||--o{ NOTIFICATION : "receives (recipient)"
    USER ||--o{ FEEDBACK : "submits (user)"
    USER ||--o{ AUDIT_LOG : "performs (actor)"
    
    COMPLAINT ||--o{ MESSAGE : "contains"
    COMPLAINT ||--o| FEEDBACK : "evaluated by"
    COMPLAINT ||--o{ NOTIFICATION : "triggers"
    CATEGORY ||--o{ COMPLAINT : "categorizes (category name)"

    USER {
        ObjectId _id PK
        string name
        string email UK "lowercase, trimmed"
        string password "hashed bcrypt"
        string role "USER | AGENT | ADMIN"
        string status "ACTIVE | INACTIVE"
        string phone
        string department "Support | Accounts | Operations"
        date createdAt
        date updatedAt
    }

    COMPLAINT {
        ObjectId _id PK
        string complaintNumber UK "CMP-YYYYMMDD-XXXXXX"
        string title "5 to 200 chars"
        string description "min 10 chars"
        string category FK "Category.name"
        string priority "LOW | MEDIUM | HIGH | URGENT"
        string status "Submitted | Assigned | In Progress | Resolved | Reopened | Closed"
        ObjectId user FK "User._id"
        ObjectId assignedAgent FK "User._id (nullable)"
        string contactPhone
        string contactAddress
        array attachments "Subdocument: filename, path, size"
        string resolutionNotes
        string reopenReason
        date resolvedAt "nullable"
        date closedAt "nullable"
        array history "Subdocument: status, actor, timestamp"
        date createdAt
        date updatedAt
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId complaint FK "Complaint._id"
        ObjectId sender FK "User._id"
        string senderName
        string senderRole
        string message "Text content"
        array readBy "User._ids"
        date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK "User._id"
        string type "STATUS_UPDATE | ASSIGNMENT | MESSAGE | FEEDBACK"
        string title
        string message
        ObjectId relatedComplaint FK "Complaint._id (nullable)"
        boolean read "default: false"
        date createdAt
    }

    CATEGORY {
        ObjectId _id PK
        string name UK "Unique category name"
        string description
        boolean isActive "default: true"
        date createdAt
    }

    FEEDBACK {
        ObjectId _id PK
        ObjectId complaint FK "Complaint._id (UK)"
        ObjectId user FK "User._id"
        int rating "1 to 5 integer stars"
        string comments "Qualitative review"
        date createdAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId actor FK "User._id"
        string actorName
        string actorRole
        string action "ASSIGNMENT | OVERRIDE | STAFF_CREATED"
        string targetType "COMPLAINT | USER | CATEGORY"
        ObjectId targetId
        string ipAddress
        object details
        date createdAt
    }
```

---

## 3. Complainant / Citizen User Flow

This diagram describes the complete user journey for an ordinary citizen from registration through complaint resolution and feedback.

```mermaid
flowchart TD
    Start([User Visits Website]) --> RegisterCheck{Already Registered?}
    
    RegisterCheck -- No --> RegisterPage[Open Registration Page]
    RegisterPage --> SubmitReg[Submit Name, Email, Password, Phone]
    SubmitReg --> ValidateReg{Valid & Unique?}
    ValidateReg -- No --> ShowRegError[Display Form Validation Error]
    ShowRegError --> RegisterPage
    ValidateReg -- Yes --> AutoLogin[Store JWT & Redirect to Dashboard]
    
    RegisterCheck -- Yes --> LoginPage[Open Login Page]
    LoginPage --> EnterCreds[Enter Email & Password]
    EnterCreds --> AuthCheck{Credentials Valid?}
    AuthCheck -- No --> ShowAuthError[Display Invalid Credentials Error]
    ShowAuthError --> LoginPage
    AuthCheck -- Yes --> LoadDashboard[Load User Dashboard]
    
    AutoLogin --> LoadDashboard
    
    LoadDashboard --> UserActions{User Action}
    UserActions --> ViewList[View My Complaints Queue]
    UserActions --> FileComplaint[Register New Complaint]
    UserActions --> EditProfile[View/Update User Profile]
    
    FileComplaint --> FormFill[Enter Title, Description, Priority, Category, Attachments]
    FormFill --> SubmitTicket[Submit POST /api/complaints]
    SubmitTicket --> VerifyCategory{Category Valid & Active?}
    VerifyCategory -- No --> CategoryError[Prompt to Select Valid Category]
    VerifyCategory -- Yes --> TicketCreated[Assign Unique CMP-ID & Status 'Submitted']
    TicketCreated --> NotifyConfirm[In-App Confirmation Dispatched]
    NotifyConfirm --> ViewList
    
    ViewList --> SelectTicket[Click Complaint Details]
    SelectTicket --> ViewHistory[Inspect Status History & Audit Steps]
    ViewHistory --> ChatAction[Send Real-Time Message in Chat]
    ChatAction --> ChatWait{Is Complaint Closed?}
    ChatWait -- Yes --> ClosedNotice[Display Thread Archived Alert]
    ChatWait -- No --> MsgSent[Socket Dispatches Message to Agent]
    
    ViewHistory --> CheckResolution{Complaint Resolved?}
    CheckResolution -- Yes --> FeedbackDecision{Satisfied with Resolution?}
    FeedbackDecision -- Yes --> SubmitFeedback[Rate 1-5 Stars & Submit Review]
    SubmitFeedback --> CloseCase[Case Finalized]
    FeedbackDecision -- No --> ReopenTicket[Click Reopen Ticket & State Reason]
    ReopenTicket --> StatusReopened[Status Moves to 'Reopened' & Agent Notified]
    StatusReopened --> ViewHistory
```

---

## 4. Support Agent Workflow

This diagram outlines how support technicians interact with their queue, diagnose issues, record progress notes, communicate with complainants, and submit resolution summaries.

```mermaid
flowchart TD
    AgentLogin([Agent Signs In]) --> LoadAgentDash[Load Agent Dashboard]
    LoadAgentDash --> ViewWorkload[Review Workload Counters: In Progress, Resolved, Pending]
    ViewWorkload --> OpenQueue[Open Assigned Complaints Queue]
    
    OpenQueue --> SelectAssigned[Select Assigned Complaint]
    SelectAssigned --> CheckStatus{Current Status?}
    
    CheckStatus -- "Assigned" --> StartButton[Click 'Start Progress']
    StartButton --> MoveInProgress[PATCH /status -> 'In Progress']
    MoveInProgress --> NotifyUserProgress[Complainant Receives Notification]
    
    CheckStatus -- "Reopened" --> ResumeButton[Click 'Start Progress' to Resume Work]
    ResumeButton --> MoveInProgress
    
    CheckStatus -- "In Progress" --> ActiveWork[Diagnostic & Remedial Work Active]
    
    ActiveWork --> LogMilestone[Enter Internal Progress Note]
    LogMilestone --> PostNote[POST /api/agent/complaints/:id/notes]
    PostNote --> AuditAppended[Appended to History Timeline]
    
    ActiveWork --> LiveComm[Chat with Complainant via WebSocket Thread]
    LiveComm --> ComplainantClarifies[Exchange Clarifications / Photos]
    
    ActiveWork --> FixFinished{Remedial Actions Complete?}
    FixFinished -- Yes --> ClickResolve[Click 'Mark as Resolved']
    ClickResolve --> EnterNotes[Enter Official Resolution Summary Notes]
    EnterNotes --> SubmitResolve[Submit PATCH /status -> 'Resolved']
    SubmitResolve --> UserAlerted[Complainant Notified to Test & Provide Feedback]
    UserAlerted --> EndAgent([Ticket Awaits Citizen Verification])
```

---

## 5. Administrator Workflow

This diagram describes the system administrator's administrative governance, complaint routing, user account management, and analytical oversight.

```mermaid
flowchart TD
    AdminLogin([Administrator Signs In]) --> AdminDashboard[Load Executive Dashboard]
    AdminDashboard --> MetricsAudit[Review Platform Metrics, SLA Rates & Workloads]
    
    AdminDashboard --> NavChoice{Admin Task}
    
    NavChoice -- Manage Complaints --> AllComplaints[Open Master Complaints Register]
    AllComplaints --> FilterTickets[Filter by Status, Category, Priority, or Search Query]
    FilterTickets --> IdentifyUnassigned[Locate 'Submitted' Unassigned Complaints]
    IdentifyUnassigned --> ClickAssign[Click 'Assign' Button]
    ClickAssign --> LoadAgents[Fetch Active Support Agents & Current Workloads]
    LoadAgents --> SelectAgent[Select Appropriate Agent & Optional Note]
    SelectAgent --> PostAssign[POST /api/admin/complaints/:id/assign]
    PostAssign --> UpdateStatusAssigned[Ticket Status Moves to 'Assigned']
    UpdateStatusAssigned --> SendAlerts[Agent & Citizen Receive In-App Notifications]
    
    NavChoice -- Manage Users --> UserDirectory[Open User Management Page]
    UserDirectory --> UserActions{User Action}
    UserActions --> ProvisionStaff[Click 'Create Staff Account']
    ProvisionStaff --> FillStaffForm[Enter Name, Email, Password, Role (AGENT/ADMIN), Dept]
    FillStaffForm --> CreateStaffAPI[POST /api/admin/users/create-staff]
    CreateStaffAPI --> StaffActive[New Staff Account Activated]
    
    UserActions --> ToggleStatus[Toggle Citizen / Agent Status (ACTIVE / INACTIVE)]
    UserActions --> ChangeRole[Update Role or Department Assignment]
    
    NavChoice -- Configure Categories --> CategoryManager[Open Category Management Page]
    CategoryManager --> AddCat[Add New Grievance Category & Description]
    CategoryManager --> ToggleCat[Toggle Category Active State]
    
    NavChoice -- Quality Review --> FeedbackPage[Open Citizen Feedback Reports]
    FeedbackPage --> InspectStars[Inspect 1-5 Star Ratings, Reviews & Timestamps]
    
    NavChoice -- Compliance Audit --> AuditLogViewer[Open System Audit Trail]
    AuditLogViewer --> ReviewLogs[Inspect Immutable IP, Actor, Timestamp & Action Logs]
```

---

## 6. MVC / Component Architecture

This diagram demonstrates how each code module aligns with the standard Model-View-Controller paradigm:

```mermaid
flowchart LR
    subgraph View ["View Layer (client/src)"]
        Pages["Pages (Landing, Login, Dashboard, Complaints, Users)"]
        Components["Components (Navbar, StatusBadge, Timeline, ChatWindow)"]
        Context["Context (AuthContext, SocketContext)"]
        Pages --- Components
        Pages --- Context
    end

    subgraph Controller ["Controller Layer (server/src/controllers)"]
        AuthController["authController.js"]
        ComplaintController["complaintController.js"]
        AgentController["agentController.js"]
        AdminController["adminController.js"]
        MessageController["messageController.js"]
        FeedbackController["feedbackController.js"]
    end

    subgraph MiddlewareRouter ["Routing & Middleware (server/src)"]
        Routes["Routes (auth, complaint, agent, admin, notification)"]
        Middlewares["Middleware (authenticate, authorize, upload, errorHandler)"]
        Routes --- Middlewares
    end

    subgraph Model ["Model Layer (server/src/models)"]
        M_User["User.js"]
        M_Complaint["Complaint.js"]
        M_Message["Message.js"]
        M_Notification["Notification.js"]
        M_Category["Category.js"]
        M_Feedback["Feedback.js"]
        M_AuditLog["AuditLog.js"]
    end

    View -->|"HTTP REST Requests / JSON"| Routes
    Middlewares --> Controller
    Controller -->|"ODM Operations"| Model
    Model -->|"Query Results"| Controller
    Controller -->|"JSON Response"| View
```
