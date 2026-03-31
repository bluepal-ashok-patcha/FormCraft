# System Architecture

**FormCraft** is a multi-tier, enterprise-class application architecture designed for scalability, security, and dynamic data modeling.

---

## 🏛 High-Level Architecture

FormCraft adheres to the **Layered Architecture Style** on the backend and uses a **Functional React Pattern** on the frontend. Communication between the frontend and backend is managed over a **RESTful JSON API**.

### System Components

1.  **Frontend (React + Vite)**: A modern, high-performance web interface using Tailwind CSS for styling and React Context + Axios for state and data management.
    - **Visual Prototype Engine**: Hover-activated, high-fidelity template previews using `framer-motion` and `AnimatePresence`.
    - **Professional Design Protocol**: Consistent 6px border radius and Google Forms-inspired clean precision.
2.  **API Gateway / Backend (Spring Boot)**: A stateless microservice handling authentication, business logic, AI orchestration, and database access.
3.  **Database (PostgreSQL 15)**: A relational storage layer with optimized support for unstructured JSONB data for dynamic form modeling.
4.  **External Services**:
    - **Google Gemini AI**: Facilitates natural language form generation.
    - **Cloudinary**: Handles high-performance image and file storage.

### Component Relationship

```mermaid
graph TD
    User((User)) -->|HTTPS| Frontend[React Frontend]
    Frontend -->|REST + JWT| Backend[Spring Boot Service]
    
    subgraph "Core Backend"
        Backend -->|Auth/Data| DB[(PostgreSQL 15)]
        Backend -->|Audit/Logs| Logs[MDC Tracer]
    end
    
    subgraph "External Integrations"
        Backend -->|GenAI| Gemini[Google Gemini AI]
        Backend -->|Storage| Cloud[Cloudinary Assets]
    subgraph "Infrastructure"
        DB -->|Migrations| FW[Flyway]
        Backend -->|Metrics| Act[Spring Actuator]
    end
    end
```

---

## 🗄 Data Model & Schema

One of FormCraft's most powerful features is its hybrid data model:
- **Relational Integrity**: Core entities like `Users`, `Roles`, and `Forms` use traditional SQL relations.
- **JSONB Flexibility**: Form structure (`schema`) and Form submissions (`response_data`) are stored as JSONB to allow for arbitrary field depth.
- **Dynamic Terminology**:
    - **Total Responses**: Tracks community engagement (formerly 'Captured Yield').
    - **Total Questions**: Measures form architecture density (formerly 'Logic Blocks').
- **Advanced Validation Rules**: Our JSONB schemas support extensive rules including `required`, `type`, `min`, `max`, `minLength`, `maxLength`, and `regex` with custom error messages.
- **Form Lifecycle Management**: Forms include `active` status with optional `startDate` and `expiryDate` for automatic scheduling.

### Schema Blueprint (Mermaid Diagram)

```mermaid
erDiagram
    USERS ||--o{ REFRESH_TOKENS : has
    USERS }|--|{ ROLES : belongs_to
    USERS ||--o{ FORMS : creates
    FORMS ||--o{ FORM_RESPONSES : receives
    FORMS {
        uuid id PK
        string name
        string slug
        jsonb schema
        timestamp created_at
    }
    FORM_RESPONSES {
        uuid id PK
        uuid form_id FK
        jsonb response_data
        timestamp created_at
    }
    USERS {
        uuid id PK
        string username
        string email
        string password
    }
```

---

## 🔐 Security Architecture

FormCraft implements a **zero-trust** security model using stateless **JWT (JSON Web Tokens)**.

### Authentication Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant S as Spring Security
    participant DB as PostgreSQL
    
    Note over C,S: Initial Login
    C->>S: POST /api/auth/login (Creds)
    S->>S: Validate Credentials
    S->>DB: Fetch User/Roles
    S->>C: Return Access (1h) + Refresh (24h)
    
    Note over C,S: Subsequent Request
    C->>S: GET /api/forms (Bearer JWT)
    S-->>C: Data Returned
    
    Note over C,S: After JWT Expiration (401)
    C->>S: POST /api/auth/refresh (Token)
    S->>DB: Validate/Rotate Token
    S->>C: Return New JWT
```

1.  **Authentication**:
    - **Initial Login**: Exchanges credentials (username/password) for an Access Token (short-lived) and a Refresh Token (long-lived).
    - **Token Rotation**: The client uses the Refresh Token to obtain new Access Tokens automatically upon expiry.
2.  **Authorization**:
    - **RBAC (Role-Based Access Control)**: Endpoints are secured using `@PreAuthorize` based on roles (`ROLE_ADMIN`, `ROLE_USER`).
3.  **Auditing**:
    - Automatic recording of `createdBy`, `updatedBy`, `createdAt`, and `updatedAt` for every entity using Spring Data Envers/Auditing.

---

## 💡 AI Core: Google Gemini Integration

The AI engine allows users to describe a form (e.g., *"Create a registration form for a marathon with medical history and emergency contact"*).

### AI Logic Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant Backend
    participant Gemini
    
    Admin->>Frontend: Enter Prompt "Create a poll"
    Frontend->>Backend: POST /api/gemini/generate
    Backend->>Gemini: Request Form Structure (JSON)
    Gemini-->>Backend: Returns Schema JSON
    Backend->>Backend: Validate Schema Integrity
    Backend-->>Frontend: Returns Form Blueprint
    Frontend->>Admin: Preview and Edit Form
```

- **Flow**: Frontend prompt → Backend → Gemini API → JSON Form Schema → Database.
- **Outcome**: A fully functional, validated form schema ready for distribution.

---

## 🛡️ Governance & Role-Aware Dashboard

FormCraft provides localized control centers based on user roles, enabling streamlined administrative workflows.

### Deep-Link Governance
- **Super Admins**: See a "Promotion Alerts" feed for pending template requests. Clicking "Approve Now" deep-links to the Template Hub with the `requested` filter pre-applied.
- **Standard Users**: See operational metrics (Drafts, Expiry). Clicking "Total Drafts" deep-links to the Form Builder and automatically triggers the **Draft Gallery**.

---

## 🔄 User Workflow Flowcharts

### Admin: Form Creation & Management
```mermaid
flowchart TD
    Start([Start]) --> Login[Login as ADMIN]
    Login --> Dash[Form Dashboard]
    Dash -->|Create New Form| Build[Build Form Schema]
    Dash -->|AI Prompt| Gemini[Gemini Generation]
    Gemini --> Build
    Build --> Save[Save & Publish Form]
    Save --> Slug[Generate Public URL]
    Slug --> Active{Active?}
    Active -- No --> Toggle[Toggle Status]
    Active -- Yes --> Share[Share with Users]
    Share --> Resp[Monitor Total Responses]
    Resp --> Export[Export to CSV]
```

### Public: Form Submission Workflow
```mermaid
flowchart TD
    Visit([Visit Form URL]) --> Check{Form Found?}
    Check -- No --> 404[Show 'Form Not Found' Message]
    Check -- Yes --> Load[Fetch JSON Schema]
    Load --> Render[Render Professional UI]
    Render --> Fill[User Fills Data]
    Fill --> FVal[Frontend Validation]
    FVal -->|Fail| Fix[Correct Answers]
    FVal -->|Pass| Submit[POST Response]
    Submit --> BVal{Backend Validation}
    BVal -- Invalid --> Error[Return Error Message]
    BVal -- Valid --> Store[Store as JSONB]
    Store --> Success[Show 'Thank You' Page]
```

## 🏗 Technology Stack Decisions

- **Why JSONB?** To avoid `ALTER TABLE` operations every time a user adds a new field to a form.
- **Why Spring Security?** For industry-leading, battle-tested authentication and high-integrity session management.
- **Why Tailwind CSS?** To maintain a cohesive design system without bloat components.
- **Why 6px Radius?** To project an established, enterprise-class professional identity throughout the application UI.
