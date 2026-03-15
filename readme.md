# FormCraft - Dynamic Form Builder Platform

FormCraft is a production-ready, industry-standard Spring Boot application designed to build, render, and manage dynamic forms. It features a flexible schema system that stores form structures and user responses as JSONB in PostgreSQL.

## 🚀 Core Features

- **Dynamic Form Builder**: Support for custom JSON schemas defining fields like Text, Number, Email, Dropdowns, and more.
- **Dynamic Rendering Support**: API endpoints to fetch schemas for runtime rendering.
- **Robust Validation**: Backend schema-based validation ensuring data integrity (Required fields, Email formats, etc.).
- **Security**: Stateless JWT Authentication with Refresh Token support and RBAC (Admin/Guest).
- **Audit Logging**: Automatic tracking of `createdAt`, `updatedAt`, `createdBy`, and `updatedBy`.
- **Performance**: Paginated responses for forms and submissions.
- **DevOps Ready**: Docker and Docker Compose support, health monitoring via Actuator, and Request Tracing via MDC.

## 🛠️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.x
- **Database**: PostgreSQL 15 (using JSONB for dynamic data)
- **Security**: Spring Security 6, JJWT
- **Migrations**: Flyway
- **Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Monitoring**: Spring Boot Actuator

## 🏗️ Architecture

The project follows a **Layered Architecture**:
1. **Controller**: Handles REST endpoints and user authorization.
2. **Service**: Contains business logic, including dynamic schema validation.
3. **Repository**: Data access layer using Spring Data JPA.
4. **Entity**: JPA entities extending a `BaseEntity` for auditing.
5. **DTO/Mapper**: Decouples internal data models from API contracts.

## 🏁 Getting Started

### Prerequisites
- Docker & Docker Compose
- Maven (if running without Docker)
- Java 17

### Local setup with Docker (Recommended)
```bash
docker-compose up --build
```
This will start the PostgreSQL database and the Spring Boot API on port `8080`.

### Database Migrations
Flyway automatically runs migrations on startup. Initial roles and schema are defined in `src/main/resources/db/migration/V1__init_schema.sql`.

## 📖 API Documentation
Once the application is running, access the Swagger UI at:
`http://localhost:8080/swagger-ui.html`

## 🔐 Authentication
- **Login**: `POST /api/auth/login`
- **Refresh**: `POST /api/auth/refresh-token`
- **Logout**: `POST /api/auth/logout`

## 📝 Schema Example
To create a form, send a POST request with a schema like this:
```json
{
  "name": "Contact Form",
  "schema": {
    "fields": [
      { "type": "text", "label": "Full Name", "required": true },
      { "type": "email", "label": "Work Email", "required": true }
    ]
  }
}
```
Validation will ensure that submissions to this form contain both fields and that the email is valid.

## 📁 Project Structure
- `com.formcraft.controller`: REST APIs
- `com.formcraft.service`: Business Logic & Validation
- `com.formcraft.entity`: Database Models (JSONB)
- `com.formcraft.security`: JWT & RBAC Logic
- `com.formcraft.config`: Global configurations (CORS, Swagger, Auditing)
- `com.formcraft.util`: Helpers (MDC Tracing, Form Validator)
