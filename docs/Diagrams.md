# 📊 Project Flow & Data Mapping

This document provides a high-level visual representation of **FormCraft's** operational logic and its underlying data architecture.

---

## 🔄 Project Operational Flow

This flowchart illustrates the end-to-end lifecycle of a form, from administrative initialization to respondent data harvesting.

```mermaid
flowchart TD
    subgraph "Administrative Phase"
        A[Registration/Login] --> B[Dashboard Hub]
        B --> C{Creation Path}
        C -->|Manual| D[Form Builder Canvas]
        C -->|AI Prompt| E[Gemini AI Orchestration]
        E --> D
        D --> F[Draft Review]
        F --> G[Strategic Configuration]
    end

    subgraph "Deployment Phase"
        G --> H[Publish to Registry]
        H --> I[Unique Slug Generation]
        I --> J[Public Dissemination]
    end

    subgraph "Respondent Phase"
        J --> K[Public Access URL]
        K --> L{Active Check}
        L -- No --> M[Access Revoked Screen]
        L -- Yes --> N[Dynamic UI Rendering]
        N --> O[User Data Entry]
        O --> P[Frontend Validation]
        P -->|Fail| O
        P -->|Pass| Q[Secure Uplink Transmission]
    end

    subgraph "Harvesting Phase"
        Q --> R[Backend Schema Validation]
        R --> S[PostgreSQL Persistence]
        S --> T[Admin Notification]
        T --> U[Analytics Dashboard]
        U --> V[CSV Tactical Export]
    end
```

---

## 🗄 Data Entity Mapping (ERD)

FormCraft uses a **Hybrid Relational-JSON** model. Core metadata is stored in strict SQL columns, while dynamic form structures and user responses are stored in optimized **JSONB** containers.

```mermaid
erDiagram
    USER ||--o{ ROLE : possesses
    USER ||--o{ REFRESH_TOKEN : authenticates
    USER ||--o{ FORM : authors
    USER ||--o{ CATEGORY : manages
    
    FORM ||--o{ FORM_RESPONSE : gathers
    FORM }|--|| CATEGORY : categorized_under
    
    TEMPLATE }|--|| CATEGORY : belongs_to
    
    USER {
        uuid id PK
        string username "Unique login handle"
        string email "Verified contact"
        string password "Hashed credential"
        string full_name
        boolean is_active "Flag for OTP verification"
        int failed_attempts
        timestamp createdAt
    }

    ROLE {
        long id PK
        string name "ROLE_ADMIN, ROLE_SUPER_ADMIN"
    }

    REFRESH_TOKEN {
        long id PK
        string token "JWT rotation key"
        timestamp expiryDate
        uuid user_id FK
    }

    FORM {
        uuid id PK
        string name "Form Title"
        string slug "Unique URL segment"
        jsonb schema "Dynamic field definitions"
        string status "ACTIVE, PLANNED, INACTIVE"
        string theme_color
        string banner_url
        timestamp starts_at "Scheduled release"
        timestamp expires_at "Automatic closing"
        uuid created_by FK
    }

    FORM_RESPONSE {
        uuid id PK
        uuid form_id FK "Mapping to parent form"
        jsonb response_data "Key-Value pairs of answers"
        timestamp createdAt
    }

    CATEGORY {
        uuid id PK
        string name "Ex. Healthcare, Tech"
        string description
    }

    TEMPLATE {
        uuid id PK
        string name "Blueprint Title"
        string description
        jsonb schema "Pre-built form structure"
        boolean is_global "System-wide availability"
        uuid category_id FK
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
    B-->>F: Response (Security Context Applied)
    F->>F: Build Dynamic Interface
    U->>F: Submit Completed Form
    F->>B: POST /api/forms/submit (JSON)
    B->>B: Run Schema Validator
    B->>D: INSERT INTO form_responses
    D-->>B: Transaction Success
    B-->>F: Return UUID Confirmation
    F->>U: Show Success Protocol
```
