# 🔄 FormCraft: Complete Lifecycle & Functional Flow

This document maps the **Total End-to-End Flow** of the FormCraft ecosystem, detailing how data, security, and logic pulses move through the multi-tier architecture.

---

## 🏛 1. Identity & Onboarding Flow
The journey begins with high-integrity account creation and verification.
1.  **Registration**: Public user submits details. Backend creates an `INACTIVE` account and triggers an asynchronous **SMTP Pulse (OTP)**.
2.  **Verification**: User enters the 6-digit code. `AuthService` verifies the OTP signature and expiration.
3.  **Authentication**: Verified user logs in. `JwtTokenProvider` issues a stateless **Access JWT (1h)** and a **Refresh Token (24h)**.
4.  **Security Context**: Every subsequent request is intercepted by the `JwtAuthenticationFilter`, which verifies the signature and populates the `SecurityContextHolder` with the user's roles (`ROLE_ADMIN` or `ROLE_SUPER_ADMIN`).

---

## 🎨 2. Form Architecture Flow (Builder)
Admins build form blueprints using manual tools or AI.
1.  **Creative Prompt**: Admin describes a form in "Plain English" on the dashboard.
2.  **AI Orchestration**: `GeminiService` sends the prompt to Google's generative engine with a strict JSON system instruction.
3.  **Schema Reception**: The AI returns a structured JSON object. 
4.  **Integrity Check**: `FormValidator` performs a deep-scan of the JSON schema, verifying field types, regex patterns, and constraints (min/max).
5.  **Persistence**: The validated schema is stored in the PostgreSQL **JSONB column**, allowing for schema-less data expansion.

---

## 🌐 3. Public Distribution & Collection Flow
Forms are served to the public via highly performant slugs.
1.  **URL Resolution**: Public user visits `/f/{slug}`. `FormController` finds the form by its unique slug.
2.  **Lifecycle Monitor**: `FormService` checks the `status` (ACTIVE), `startDate`, and `expiryDate`.
3.  **Dynamic Rendering**: `FormRunner.jsx` parses the JSONB schema and renders pixel-perfect React components using **Framer Motion** for smooth transitions.
4.  **Data Ingestion**: User submits the form.
5.  **Backend Validation**: `FormServiceImpl` performs a **Synchronous Validation Pulse** against the original JSONB schema.
6.  **Kafka Orchestration**: If valid, the submission is pushed into the **Apache Kafka Event Stream**. The user receives an immediate `202 Accepted` response.
7.  **Asynchronous Persistence**: The **`FormResponseConsumer`** worker pulls the event from the stream and saves it to the `FORM_RESPONSES` table linked to the form's UUID.

---

## 📊 4. Intelligence & Analysis Flow
Admins analyze the collected data through high-fidelity dashboards.
1.  **Metric Aggregation**: `DashboardService` calculates "Total Yield", "Active Forms", and "Expiring Assets".
2.  **Recent Activity**: The system pulls the last 5 form creations and 5 response receipts, sorted by timestamp.
3.  **Data Grid**: Admin views the response table. The backend performs a **Dynamic Header Mapping**, extracting field names directly from the JSONB data.
4.  **CSV Extraction**: Admin clicks "Export". `CsvHelper` forces phone numbers and IDs into text format to prevent Excel corruption ("Scientific Notation Prevention").

---

## ⚙️ 5. Automated Governance (Background)
The system maintains itself via automated scheduled pulses.
1.  **Form Expiry**: `FormScheduler` runs every 60 seconds, scanning for active forms whose `expiryDate` has passed and automatically setting them to `INACTIVE`.
2.  **Audit Registry**: Every major mutation (Delete Form, Create Template) triggers an **Asynchronous Audit Log**. Even if a request finishes, the audit pulse completes in the background.
3.  **Token Rotation**: Expired Access Tokens are automatically exchanged for new ones using the Refresh Token, maintaining a seamless user experience.

---
*Verified for Industry Standard Deployment. All flows are currently operational.*
