# 🏗️ FormCraft: Comprehensive API Architectural Report

This report provides a detailed breakdown of the **FormCraft Service** backend architecture, categorized by functional controllers. It documents the critical path from the UI ingestion to the database persistence layer.

---

## 🔐 1. Security & Identity Controller (`AuthController`)
**Base URL**: `/api/auth` | **Primary Service**: `AuthServiceImpl`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `POST` | `login()` | Finds user by identifier; checks `active` status and `lockoutTime`. Calls `authenticationManager` for credentials. **Repo**: `userRepository.findByUsernameOrEmail`. | `Login.jsx` |
| `/register` | `POST` | `register()` | Validates unique email/username. Hashes password. Generates 6-digit OTP. Saves as unverified. **Repo**: `existsByUsername`, `findByEmail`, `save`. | `Register.jsx` |
| `/verify-registration`| `POST`| `verifyRegistrationOtp()`| Checks OTP against `otpCode` and `otpExpiry`. Activates account. **Repo**: `findByEmail`, `save`. | `VerifyOtp.jsx` |
| `/resend-verification`| `POST`| `resendVerificationOtp()`| Generates new OTP and triggers verification email. **Repo**: `findByEmail`, `save`. | `VerifyOtp.jsx` |
| `/forgot-password` | `POST`| `forgotPasswordRequest()`| Checks identity existence. Sends reset OTP to registered email. **Repo**: `findByUsernameOrEmail`, `save`. | `ForgotPassword.jsx` |
| `/reset-password` | `POST`| `resetPasswordWithOtp()`| Validates reset OTP. Overwrites password with new Hash. Logs user in. **Repo**: `findByUsernameOrEmail`, `save`. | `ResetPassword.jsx` |
| `/refresh-token` | `POST`| `refreshTokenService` | Validates UUID token expiry. Generates new Access Token. **Repo**: `refreshTokenRepository.findByToken`. | App-wide interceptor |
| `/logout` | `POST`| `logout()` | Clears `SecurityContext`. Purges Refresh Tokens for user. **Repo**: `refreshTokenRepository.deleteByUserId`.| Global Sidebar/Header |

---

## 📝 2. Form Asset Controller (`FormController`)
**Base URL**: `/api/forms` | **Primary Service**: `FormServiceImpl`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | `createForm()` | Maps request to Entity. Generates unique URL `slug`. Sets initial status. **Repo**: `formRepository.save`. | `FormBuilder.jsx` |
| `/` | `GET` | `getAllForms()` | Role-based filtering. Admins see owned; Super Admins see all. Supports search/status filters. **Repo**: `formRepository.findAll(Spec)`.| `FormList.jsx` |
| `/{id}` | `GET` | `getFormById()` | Fetches full architectural JSON (fields/settings/logic). **Repo**: `formRepository.findById`. | `FormBuilder.jsx` |
| `/s/{slug}` | `GET` | `getFormBySlug()` | Public entry point. Loads form for respondents. **Repo**: `formRepository.findBySlug`. | `FormViewer.jsx` |
| `/submit` | `POST` | `submitResponse()`| Validates input data against Form schema. Records ID of respondent (if logged in). **Repo**: `formResponseRepository.save`.| `FormViewer.jsx` |
| `/{id}/responses` | `GET` | `getResponsesByFormId()`| Fetches paginated response data for a specific form. **Repo**: `formResponseRepository.findByFormId`. | `FormResponses.jsx` |
| `/{id}/toggle-status`| `PUT` | `toggleFormStatus()`| Flips `ACTIVE`/`INACTIVE`. Used for manual form closing. **Repo**: `formRepository.save`. | `FormList.jsx` |
| `/{id}` | `DELETE`| `deleteForm()` | Purges form structure and all submitted data. **Repo**: `formRepository.deleteById`. | `FormList.jsx` |
| `/draft` | `POST` | `saveDraft()` | Saves intermediate builder state to a separate Draft table. **Repo**: `formDraftRepository.save`.| `FormBuilder.jsx` |

---

## 📊 3. Operational Intelligence Controller (`DashboardController`)
**Base URL**: `/api/dashboard` | **Primary Service**: `DashboardService`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/stats` | `GET` | `getDashboardStats()` | Aggregates KPIs: Total Forms, Submissions, Growth Trends, and Expiring Assets. **Repo**: `countBy...`, `findResponseStatsByCreatedBy`. | `Dashboard.jsx` |

---

## 🎨 4. Blueprint Hub Controller (`TemplateController`)
**Base URL**: `/api/templates` | **Primary Service**: `TemplateServiceImpl`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | `getAllVisibleTemplates()`| Fetches public blueprints + user's private blueprints. **Repo**: `templateRepository.findAllVisible`. | `TemplateHub.jsx` |
| `/categories` | `GET` | `getAllCategories()` | Returns grouped taxonomy for easy browsing. **Repo**: `categoryRepository.findAll`. | `TemplateHub.jsx` |
| `/{id}/promote` | `POST` | `promoteToGlobal()` | **Elite Governance**: Super Admin approves private template for global use. **Repo**: `templateRepository.save`. | `TemplateHub.jsx` |
| `/{id}/decertify` | `POST` | `decertifyTemplate()`| Removes template from global visibility. **Repo**: `templateRepository.save`. | `TemplateHub.jsx` |

---

## 🤖 5. Neural Engine Controller (`GeminiController`)
**Base URL**: `/api/ai` | **Primary Service**: `GeminiServiceImpl`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/generate-blueprint`| `POST`| `generateFormBlueprint()`| Feeds description to Google Gemini 1.5 Pro. Returns valid JSON fields. No Repo usage. | `FormBuilder.jsx` |
| `/generate-regex` | `POST`| `generateContent()` | Generates complex validation logic based on user's field objective. No Repo usage. | `FormBuilder.jsx` |
| `/recommend-theme` | `POST`| `generateThemeBlueprint()`| AI analysis of form title to suggest brand colors (HSL). No Repo usage. | `FormBuilder.jsx` |

---

## 📁 6. Data Stream Hub (`ResponseController`)
**Base URL**: `/api/responses` | **Primary Service**: `FormServiceImpl`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/{id}` | `DELETE`| `deleteResponse()` | Manually remove a specific submission entry. **Repo**: `formResponseRepository.deleteById`. | `FormResponses.jsx` |
| `/{id}` | `PUT` | `updateResponse()` | Allows Admin to correct or annotate submitted data. **Repo**: `formResponseRepository.save`. | `FormResponses.jsx` |

---

## 🖼️ 7. Media Asset Controller (`ImageController`)
**Base URL**: `/api/images` | **Primary Service**: `CloudinaryService`

| Endpoint URL | Method | Service Method | Logic & Repository Actions | UI Context |
| :--- | :--- | :--- | :--- | :--- |
| `/upload` | `POST` | `uploadFile()` | Forwards multi-part files to Cloudinary for global CDN hosting. No Repo usage. | `FormBuilder.jsx` |

---

### 🛡️ System-Wide Governance Note:
Every API call above is protected by **Spring Security**. Role-based access control (RBAC) ensures `hasRole('ADMIN')` or `hasRole('SUPER_ADMIN')` is checked at the entry point of sensitive methods. All database mutations trigger an entry in the **`AuditService`** for historical traceability.
