# API Reference

**FormCraft** exposes a RESTful API for form building, rendering, and response management. All requests should be sent to the base URL: `http://localhost:8080/api`.

---

## 🔐 Authentication APIs

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/auth/register` | `POST` | Registers a new user. | PUBLIC |
| `/auth/login` | `POST` | Authenticates and returns JWT + Refresh Token. | PUBLIC |
| `/auth/refresh-token` | `POST` | Exchanges a Refresh Token for a new Access Token. | PUBLIC |
| `/auth/logout` | `POST` | Invalidates the current user session. | USER |
| `/auth/profile` | `GET` | Fetches the current user's profile metadata. | USER |

---

## 📝 Form Management APIs

Managing form structures and schemas.

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/forms` | `GET` | Retrieves all forms (paginated). Supports `search`, `status`, `startDate`, `endDate`. | ADMIN |
| `/forms` | `POST` | Creates a new form from a JSON schema. | ADMIN |
| `/forms/{id}` | `GET` | Fetches a single form by ID. | ADMIN |
| `/forms/s/{slug}` | `GET` | Fetches form schema by slug (used for public rendering). | PUBLIC |
| `/forms/{id}` | `PUT` | Updates an existing form's schema or name. | ADMIN |
| `/forms/{id}` | `DELETE` | Deletes a form and all its associated responses. | ADMIN |
| `/forms/{id}/toggle-status` | `PUT` | Manually enables or disables a form. | ADMIN |
| `/forms/{id}/schedule` | `POST` | Sets a form to auto-deactivate after `X` days. | ADMIN |

---

## 📤 Response Management APIs

Managing user-submitted data.

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/responses/f/{slug}` | `POST` | Submits form data for a specific slug. | PUBLIC |
| `/responses/form/{id}` | `GET` | Fetches all responses for a specific form. | ADMIN |
| `/forms/{id}/responses/export` | `GET` | Downloads all responses for a form as a `.csv` file. | ADMIN |
| `/responses/{id}` | `GET` | Fetches a single user submission by ID. | ADMIN |
| `/responses/{id}` | `PUT` | Updates an existing submission's answers. | ADMIN |
| `/responses/{id}` | `DELETE` | Deletes a specific submission. | ADMIN |

---

## 🧠 AI & Advanced Features APIs

| Endpoint | Method | Description | Roles |
| :--- | :--- | :--- | :--- |
| `/gemini/generate` | `POST` | Generates a JSON form schema from a prompt. | ADMIN |
| `/templates` | `GET` | Fetches a list of pre-defined form templates. | USER |
| `/images/upload` | `POST` | Uploads an image to Cloudinary and returns its URL. | USER |
| `/dashboard/stats` | `GET` | Fetches high-level metrics (total forms, submissions). | ADMIN |

---

## 🏗 Standard Request & Response Format

### **Request Header**
Every authenticated request requires a Bearer token:
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### **Successful Response Wrapper**
```json
{
  "status": "SUCCESS",
  "message": "Operation completed successfully",
  "data": { ... },
  "id": "e4f3..."
}
```

### **Error Response Wrapper**
```json
{
  "status": "ERROR",
  "message": "Validation failed: Email already exists.",
  "errors": [
    "Field 'email' must be valid.",
    "Form name is required."
  ],
  "timestamp": "2024-03-21T10:00:00Z"
}
```

---

## 📖 Swagger Interactive Documentation
For a full list of parameters, request bodies, and interactive testing, start the server and visit:
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
