# Backend Engineering Guide

**FormCraft Backend** is a Java 17, Spring Boot 3.2 based service providing a high-performance RESTful API.

---

## 🏛 Package Organization

- **`com.formcraft.config`**: Centralized configuration (CORS, JWT, Cloudinary, Auditing).
- **`com.formcraft.controller`**: REST APIs with validation and security constraints.
- **`com.formcraft.dto`**: Contracts for data exchange, decoupled from database entities.
- **`com.formcraft.entity`**: Persistent models using JPA (including `BaseEntity` for auditing).
- **`com.formcraft.mapper`**: Mapping between DTOs and Entities.
- **`com.formcraft.repository`**: JPA-based data access (Spring Data JPA).
- **`com.formcraft.security`**: Custom security filters, JWT providers, and token rotation.
- **`com.formcraft.service`**: Business logic (e.g., JSONB validation, AI generation).
- **`com.formcraft.exception`**: Global `@RestControllerAdvice` for standard error wrapping.

---

## 🛠 Core Technologies & Features

### 1. Spring Boot 3.2
- Modern, lightweight, and high productivity framework.
- Uses **Spring Data JPA** for robust database interaction.

### 2. Spring Security 6 (JWT)
- **Stateless Auth**: Authentication is handled via signed JWTs.
- **Refresh Token Rotation**: Implements a high-security refresh mechanism.
- **RBAC**: Endpoints are role-protected (`ROLE_ADMIN`, `ROLE_USER`).

### 3. Sophisticated JSON Schema Validation
Unlike standard form tools, FormCraft uses a robust `FormValidator` that enforces:
- **Strict Typing**: Automatic coercion and checking for `number`, `email`, and `text`.
- **Constraint Enforcement**: `minLength`, `maxLength`, `min`, and `max` limits for values and strings.
- **Custom Regex Support**: Custom regex patterns can be embedded directly into the JSON schema for specialized fields (e.g. specialized ZIP codes or product IDs).
- **Graceful Error Logic**: Custom error messages can be defined within the schema to provide a localized/branded user experience.

### 4. Automatic Form Lifecycle (Scheduling)
FormCraft supports temporal form availability.
- **Scheduled Activation**: Forms can be set with a `startDate` and will only become "Public" once the time is reached.
- **Auto-Expiry**: Forms with an `endDate` are automatically deactivated by a background scheduler (`FormScheduler`) running every minute, preventing further submissions.

### 5. High-Fidelity CSV Export
Enterprise-grade CSV generation:
- **Dynamic Header Mapping**: Automatically maps JSONB keys to clean CSV column headers.
- **Scientific Notation Prevention**: Sophisticated regex in `CsvHelper` prevents Excel from corrupting large numeric IDs (like phone numbers) by forcing text formatting.

### 4. Database Migrations (Flyway)
- Migration scripts are located in `src/main/resources/db/migration`.
- Flyway automatically applies migrations during startup, ensuring database state is consistent across team environments.

### 5. AI Integration (Gemini)
- Integration with Google Gemini for natural language form building.
- Prompt engineering allows Gemini to export a JSON object that satisfies our internal schema requirements.

### 6. Monitoring & Logging
- **Spring Boot Actuator**: Provides `/health`, `/metrics`, and `/info` endpoints.
- **MDC Tracing**: Every request is assigned a `traceId` which is included in 모든 log messages for easier debugging.

---

## 🔧 Key Configurations

Configurations are managed via `application.yml`:

```yaml
app:
  jwt-secret: "${JWT_SECRET}"
  jwt-expiration-milliseconds: 3600000 # 1 hour
  jwt-refresh-expiration-milliseconds: 86400000 # 24 hours
  max-failed-attempts: 5

spring:
  datasource:
    url: "${SPRING_DATASOURCE_URL}"
  jpa:
    hibernate:
      ddl-auto: none # Controlled by Flyway
```

---

## 🧪 Development Workflow

1.  **Run with Maven**: `./mvnw spring-boot:run`
2.  **Add a Feature**: Create a DTO → Create a Service → Create a Controller.
3.  **Schema Change**: Do NOT modify JPA Entity directly for form schema changes; update the JSONB schema logic.
4.  **Test**: Run `./mvnw test` before every commit.
