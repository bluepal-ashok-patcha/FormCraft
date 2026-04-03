# 📊 Project Flow & Data Mapping

This document provides a high-level visual representation of **FormCraft's** operational logic and its underlying data architecture.

---

## 🔄 Project Operational Flow

This flowchart illustrates the end-to-end lifecycle of a form, from administrative initialization to respondent data harvesting.

```mermaid
flowchart TD
    subgraph "Administrative Phase"
        A[Registration/Login] --> B[Form Dashboard]
        B --> C{Creation Path}
        C -->|Manual| D[Form Builder Canvas]
        C -->|AI Prompt| E[Gemini AI Orchestration]
        C -->|Deep-Link| G[Draft Gallery]
        G --> D
        E --> D
        D --> F[Visual Prototype Review]
        F --> H[Strategic Configuration]
    end

    subgraph "Deployment Phase"
        H --> I[Publish to Registry]
        I --> J[Unique Slug Generation]
        J --> K[Public Share/Distribute]
    end

    subgraph "Respondent Phase"
        K --> L[Public Form URL]
        L --> M{Form Found?}
        M -- No --> N[Form Not Found Screen]
        M -- Yes --> O[Render Professional UI]
        O --> P[User Answer Entry]
        P --> Q[Validation Protocol]
        Q -->|Fail| P
        Q -->|Pass| R[Secure Submission Uplink]
    end

    subgraph "Analytics Phase"
        R --> S[Backend Schema Validation]
        S --> T[PostgreSQL Persistence]
        T --> U[Audit Registry Logging]
        U --> V[Admin Stats Update]
        V --> W[View Responses Analytics]
    end
```

---

## 🏗️ Governance Flow (Super Admin)

```mermaid
flowchart LR
    A[Super Admin Dashboard] --> B{Promotion Alert}
    B --> C[View Template Request]
    C --> D[Live Visual Prototype]
    D --> E{Approve?}
    E -- Yes --> F[Promote to Global Template Hub]
    E -- No --> G[Dismiss Request]
```

---

## 🗄 Data Entity Mapping (ERD)

FormCraft uses a **Hybrid Relational-JSON** model. Core metadata is stored in strict SQL columns, while dynamic form structures and user responses are stored in optimized **JSONB** containers.

```mermaid
erDiagram
    USER ||--o{ ROLE : possesses
    USER ||--o{ REFRESH_TOKEN : authenticates
    USER ||--o{ FORM : authors
    
    FORM ||--o{ FORM_RESPONSE : gathers
    
    TEMPLATE }|--|| CATEGORY : belongs_to
    AUDIT_LOG ||--o{ USER : performed_by
    
    USER {
        uuid id PK
        string username "Unique login handle"
        string email "Verified contact"
        string password "Hashed credential"
        boolean is_active "Flag for OTP verification"
        int failed_attempts
        timestamp created_at
    }

    REFRESH_TOKEN {
        long id PK
        string token "JWT rotation key"
        timestamp expiry_date
        uuid user_id FK
    }

    FORM {
        uuid id PK
        string name "Form Title"
        string slug "Unique URL segment"
        jsonb schema "Dynamic field definitions"
        string status "ACTIVE, INACTIVE"
        string theme_color
        string banner_url
        timestamp starts_at "Start Date"
        timestamp expires_at "Expiry Date"
        string created_by "Username auditing"
    }

    FORM_RESPONSE {
        uuid id PK
        uuid form_id FK "Mapping to parent form"
        jsonb response_data "Answers JSONB"
        timestamp created_at
    }

    CATEGORY {
        uuid id PK
        string name "Ex. HEALTHCARE, TECH"
        string label "Display Name"
    }

    TEMPLATE {
        uuid id PK
        string name "Blueprint Title"
        string description
        jsonb schema "Form structure"
        boolean is_global "System-wide"
        boolean requested_for_global "Promotion status"
        string thumbnail_url
        uuid category_id FK
    }

    AUDIT_LOG {
        uuid id PK
        string action "CREATE, DELETE, etc"
        string actor "Username"
        string entity_type "FORM, TEMPLATE"
        uuid entity_id
        string details
        timestamp created_at
    }
```

---

## 📡 Request Sequence (Auth + Data)

Visualizing the secure transaction between the React Client and the Spring Boot Kernel.

```mermaid
sequenceDiagram
    participant U as Respondent
    participant F as React Frontend
    participant B as Spring Boot API
    participant D as PostgreSQL (JSONB)
    
    U->>F: Access Form Link
    F->>B: GET /api/forms/s/{slug}
    B->>D: Find Form by Slug
    D-->>B: Return JSON Schema
    B-->>F: Response (Professional UI Built)
    F->>F: Build Dynamic Interface
    U->>F: Submit Completed Answers
    F->>B: POST /api/forms/submit (JSON)
    B->>B: Run Schema Validator
    B->>D: INSERT INTO form_responses
    D-->>B: Transaction Success
    B-->>F: Return UUID Confirmation
    F->>U: Show 'Thank You' Protocol
```
