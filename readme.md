# FormCraft - Enterprise Form Building Re-imagined

![FormCraft Banner](https://img.shields.io/badge/FormCraft-V1.0.0-blue?style=for-the-badge&logo=spring&logoColor=white)
![Kafka Architecture](https://img.shields.io/badge/Architecture-Event--Driven-success?style=for-the-badge&logo=apache-kafka)
![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)

FormCraft is a **High-Throughput (10k+ concurrent)**, industry-ready platform designed for extreme-scale form ingestion. Built using **Spring Boot 3.4**, **Apache Kafka**, and **React + Vite**, it leverages an asynchronous event pipeline to decouple ingestion from database persistence.

---

## 🚀 Vision
Standard forms are rigid. **FormCraft** allows developers to create complex, multi-field forms on-the-fly, validate them with high-integrity "Fail-Fast" logic, and ingest them into a global event stream for reliable background processing.

## 🌉 New: Asynchronous Architecture (v1.1)
- **Non-Blocking Ingestion**: Submission endpoints now return **HTTP 202 (Accepted)**, offloading persistence to Kafka.
- **Event-Driven Workers**: Dedicated consumers handle database writing, auditing, and analytics in the background.
- **Resilient Persistence**: Powered by **PostgreSQL 16 (JSONB)** with GIN indexing for millisecond-level search.

## 🛠 Features
- **Dynamic Field System**: Text, Number, Email, Dropdowns, Date, File Uploads.
- **AI-Powered Builder**: Natural language form generation via **Google Gemini AI**.
- **Enterprise Security**: JWT-based stateless auth with high-integrity token rotation.
- **Fail-Fast Validation**: Synchronous schema checks before Kafka production to prevent "Poison Pill" events.

---

## 🧩 Tech Ecosystem

| Tier | Technologies |
| :--- | :--- |
| **Messaging** | **Apache Kafka (Kraft Mode)**, Zookeeper |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Java 17, Spring Boot 3.4, Spring Security |
| **Database** | **PostgreSQL 16**, HikariCP, JSONB Indexes |
| **AI Hub** | Google Gemini Generative AI |
| **Storage** | Cloudinary (Assets) |
| **Testing** | **Testcontainers**, **Awaitility**, JUnit 5 |

---

## ⚡ Quick Start (Docker Orchestration)

Launch the entire high-availability stack with a single pulse:

```bash
docker-compose up -d --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 📖 Technical Deep-Dives

1.  **[Architecture.md](./docs/Architecture.md)**: Kafka Pipeline, Zookeeper Coordination, and Data Models.
2.  **[Getting Started](./docs/Setup.md)**: Standard installation, Docker verification, and .env configuration.
3.  **[Testing Manual](./docs/Testing_Manual.md)**: Full Coverage strategy, Testcontainers, and QA standards.
4.  **[API Reference](./docs/API_Reference.md)**: Deep-dive into REST endpoints and JSON payloads.

---

## ✉️ Support & License
Developed for Murali Sir Projects. Proprietary License.
