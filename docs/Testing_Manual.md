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
| **Mockito** | Mocking framework for isolating dependencies. |
| **Testcontainers** | **Kafka & Postgres** integration testing (Standard-aligned). |
| **Awaitility** | **Asynchronous polling** for validating Kafka event persistence. |
| **JaCoCo** | Java Code Coverage analysis (80% Green Gate). |
| **MockMvc** | Specialized framework for testing REST Controller endpoints. |

---

## 🧪 Testing Layers

### 1. Unit Testing (Service & Utility)
We isolate the business logic using Mockito to stub repository and external service responses.
- **FormValidator**: Exhaustive testing of JSONB schema constraints (regex, min/max, type formats).
- **Service Impls**: Verifying role-based logic, promotion flows, and calculation accuracy.
- **Kafka Producers**: Mocked during unit tests to verify that `submitResponse` correctly serializes messages and pushes to the topic.

### 2. Controller Testing (Web Layer)
Testing the REST API surface while mocking security contexts and service results.
- **Status Codes**: 202 Accepted (Submit), 200/201 (Admin and creation).
- **Validation**: Testing `@Valid` request body constraints.

### 3. Integration Testing (The Infrastructure Chain)
Using **Testcontainers (Kafka + Postgres)** to launch a real, isolated ecosystem during the build.
- **Event Persistence Flow**: 
    1.  Submit form via `MockMvc`.
    2.  `Awaitility.await()` for the background worker to consume the message.
    3.  Verify the database state after consumption.

### 4. Security & Audit Testing
- **JWT Rotation**: Verifying token exchange and refresh logic.
- **RBAC**: Testing that `@PreAuthorize` correctly blocks unauthorized actions.
- **Async Auditing**: Testing that the `AuditService` records all mutations in the background.

---

## 📊 Running Coverage & Analysis

### Execute full test suite:
```bash
mvn clean test
```

### Analyze Coverage Report (JaCoCo):
After running the tests, the HTML coverage report is generated at:
`target/site/jacoco/index.html`

---

## 🏗 CI/CD Quality Gates
FormCraft uses industry-standard quality gates:
1.  **Build Phase**: Compiles the code and runs unit tests.
2.  **Test Phase**: Runs integration tests using real Dockerized Kafka/Postgres.
3.  **Verification Phase**: JaCoCo analyzes coverage. Fail if < **80%**.

---

## ✉️ Support
For questions regarding the testing registry, contact the QA lead.
