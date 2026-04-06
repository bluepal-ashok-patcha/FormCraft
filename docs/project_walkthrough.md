# 🚀 FormCraft: Comprehensive Project Walkthrough

Welcome to the **FormCraft** guided architectural tour. This document connects the dots between our high-level vision and the technical implementation, providing a map for developers to navigate the entire ecosystem.

---

## 🏛 Project Anatomy

FormCraft is split into two primary modules, following a clean **Client-Server separation**:

### 1. [formcraft-frontend](./formcraft-frontend) (React + Vite)
The UI engine responsible for the professional "Enterprise Identity" of the application.
- **`src/components`**: Modular UI primitives (Buttons, Modals, Form Fields).
- **`src/pages`**: Full-page layouts (Dashboard, Form Runner, Template Gallery).
- **`src/services`**: Axios-based API wrappers talking to the backend.
- **`src/layouts`**: Structural shells (Admin Shell vs Public Form Shell).

### 2. [formcraft-service](./formcraft-service) (Spring Boot)
The high-integrity core that handles all governance, security, and AI orchestration.
- **`src/main/java/com/formcraft/controller`**: REST API Surface.
- **`src/main/java/com/formcraft/service`**: Enterprise Business Logic (The "Brain").
- **`src/main/java/com/formcraft/entity`**: JPA Data Models using JSONB for schema-less flexibility.
- **`src/main/java/com/formcraft/security`**: Stateless JWT and RBAC filters.
- **`src/main/java/com/formcraft/exception`**: Centralized Error Handling Protocols.

---

## 🔄 Core Data Flows

### The "Form Blueprint" Flow (AI Generation)
1.  **Input**: Admin enters a prompt on the dashboard.
2.  **Request**: Frontend sends the prompt to the `/api/gemini/generate` endpoint.
3.  **Processing**: `GeminiService` prepares a specialized system prompt, calls Google's AI, and parses the returned JSON schema.
4.  **Verification**: `FormValidator` checks the AI-generated JSON for structural integrity.
5.  **Persistence**: The validated schema is stored in the `FORMS` table's JSONB column.

### The "Response Capture" Flow
1.  **Public Access**: A user visits a unique form slug (e.g., `/f/survey-2024`).
2.  **Rendering**: `FormRunner.jsx` fetches the JSONB schema and dynamically builds the React inputs.
3.  **Submission**: User hits "Submit". Frontend triggers validation based on schema rules (regex, required, etc.).
4.  **Backend Pulsing**: `FormServiceImpl` processes the response, logs an audit entry, and stores the results.

---

## 🛡️ Security & Governance

FormCraft uses a **Stateless Security Strategy**:
- **JWT Tokens**: Every request from the frontend is signed with a high-integrity JWT.
- **Refresh Rotation**: Tokens rotate every 24 hours to prevent unauthorized session hijacking.
- **Audit Logs**: Every administrative pulse (deleting a form, promoting a template) is recorded in the `AUDIT_LOGS` registry for forensic tracking.

---

## 📊 Quality & Testing

We maintain a strict quality gate:
- **[Testing Manual](./docs/Testing_Manual.md)**: Details our 80%+ coverage strategy using JUnit, Mockito, and JaCoCo.
- **[Test Case Registry](./test_cases_registry.md)**: A verified list of 100 functional test cases (all currently PASSING).
- **[API Reference](./docs/API_Reference.md)**: Detailed mapping of all 20+ REST endpoints.

---

## 🏁 Getting Started

To spin up the entire enterprise stack on your local system, follow the **[Setup Guide](./docs/Setup.md)**. 

If you're a developer looking to contribute, please review our **[Contributing Guidelines](./docs/Contributing.md)** to maintain our 6px-radius design consistency and MDC logging standards.

---
*Developed for Murali Sir Projects. Proprietary Architectural Blueprint.*
