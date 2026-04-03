# 🛡️ FormCraft Testing & Quality Assurance Manual

This document outlines the testing strategy, standards, and operational procedures for maintaining the high-integrity code standards of the **FormCraft** enterprise service.

---

## 🏛️ Testing Philosophy
FormCraft follows a **Multi-Layered Testing Strategy** to ensure that every architectural pulse—from security filters to AI generation—is verified for precision and stability. Our target is a minimum of **80% Backend Code Coverage** for all critical business logic.

---

## 🛠️ Toolchain & Ecosystem

| Technology | Purpose |
| :--- | :--- |
| **JUnit 5 (Jupiter)** | Core testing framework for unit and integration tests. |
| **Mockito** | Mocking framework for isolating service dependencies. |
| **JaCoCo** | Java Code Coverage library for analyzing branch and line coverage. |
| **Testcontainers** | Docker-based integration testing for PostgreSQL persistence. |
| **MockMvc** | Specialized framework for testing REST Controller endpoints. |
| **StepVerifier** | Reactive stream testing for Gemini AI asynchronous pulses. |

---

## 🧪 Testing Layers

### 1. Unit Testing (Service & Utility)
We isolate the business logic using Mockito to stub repository and external service responses.
- **FormValidator**: Exhaustive testing of JSONB schema constraints (regex, min/max, type formats).
- **Service Impls**: Verifying role-based logic, promotion flows, and calculation accuracy.
- **Mappers**: Ensuring zero-loss data translation between Entities and DTOs.

### 2. Controller Testing (Web Layer)
Testing the REST API surface while mocking security contexts and service results.
- **Status Codes**: Ensuring correct 200, 201, 400, 404, and 500 responses.
- **Validation**: Testing `@Valid` request body constraints.
- **Exception Handling**: Verifying the `GlobalExceptionHandler` returns consistent `ApiResponse` payloads.

### 3. Integration Testing (Persistence Layer)
Using **Testcontainers** to launch a real PostgreSQL instance during the build.
- **JPA Queries**: Verifying complex custom `@Query` and `Specification` logic.
- **Flyway Migrations**: Ensuring the database schema is correctly initialized from scratch.

### 4. Security & Audit Testing
- **Lockout Logic**: Verifying that 5 failed login attempts trigger the 15-minute account block.
- **RBAC**: Testing that `@PreAuthorize` correctly blocks `ROLE_USER` from Administrative actions.
- **Audit Logs**: Ensuring that every mutating action (Create, Update, Delete) is asynchronously recorded in the audit registry.

---

## 📊 Running Coverage & Analysis

### Execute full test suite:
```bash
./mvnw clean test
```

### Analyze Coverage Report (JaCoCo):
After running the tests, the HTML coverage report is generated at:
`target/site/jacoco/index.html`

**Key Metrics Tracked:**
- **Line Coverage**: Ensures every line of logic is executed.
- **Branch Coverage**: Critical for complex `if/else` and `switch` logic in `DashboardService` and `FormValidator`.

---

## 🏗 CI/CD Quality Gates
FormCraft uses industry-standard quality gates to prevent code regression:
1.  **Build Phase**: Compiles the code and runs all unit tests.
2.  **Test Phase**: Runs integration tests using Docker-in-Docker.
3.  **Verification Phase**: JaCoCo analyzes coverage. If coverage falls below **80%**, the build fails automatically.

---

## ✉️ Support
For questions regarding the testing registry or test case addition, contact the Quality Assurance lead.
