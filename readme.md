# FormCraft - Enterprise Form Building Re-imagined

![FormCraft Banner](https://img.shields.io/badge/FormCraft-V1.0.0-blue?style=for-the-badge&logo=spring&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)

FormCraft is a high-performance, industry-ready platform designed to model, render, and manage dynamic forms with extreme flexibility. Built using **Spring Boot 3.2** and **React + Vite**, it leverages a JSONB-based schema architecture within PostgreSQL to enable schema-less data storage while maintaining strict backend validation.

---

## 🚀 Vision
Standard forms are rigid. **FormCraft** allows developers and businesses to create complex, multi-field forms on-the-fly, validate them with high precision, and analyze the resulting data in real-time. With the integration of **Google Gemini AI**, form creation is as easy as describing what you need.

## 🛠 Features
- **Dynamic Field System**: Support for diverse input types (Text, Number, Email, Dropdowns, Date, File Uploads).
- **AI-Powered Builder**: Generate entire form structures from simple natural language prompts.
- **Stateless Security**: Secure JWT-based authentication with high-integrity Refresh Token rotation.
- **Enterprise Auditing**: Complete history tracking for all form modifications and responses.
- **Production Performance**: Paginated APIs, optimized JSONB queries, and high-speed delivery.
- **Sleek Interface**: A modern, high-end UI built with React, Tailwind CSS, and Framer Motion.

---

## 🧩 Tech Ecosystem

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Radix UI, Framer Motion |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security 6 |
| **Database** | PostgreSQL 15 (JSONB), Flyway |
| **AI Integration** | Google Gemini Generative AI |
| **Storage** | Cloudinary (Image/Assets) |
| **Monitoring** | Spring Boot Actuator, MDC Logging |

---

## 📖 Complete Documentation

Explore our deep-dive documentation for technical details, setup guides, and API specifications:

0.  **[Project Walkthrough](./project_walkthrough.md)**: A guided tour of the architecture and data flows.
1.  **[Getting Started](./docs/Setup.md)**: Standard installation and Docker orchestration.
2.  **[Total Project Lifecycle](./docs/Lifecycle_Flow.md)**: End-to-end data, security, and functional flows.
3.  **[System Architecture](./docs/Architecture.md)**: Data models, security flows, and architecture principles.
3.  **[Backend Engineering](./docs/Backend.md)**: Service layer, Security, and JPA implementations.
4.  **[Frontend UI Guide](./docs/Frontend.md)**: Design system, components, and state management.
5.  **[API Reference](./docs/API_Reference.md)**: Comprehensive REST API specifications.
6.  **[Testing Manual](./docs/Testing_Manual.md)**: Coverage strategy, tools, and QA standards.
7.  **[Contributing](./docs/Contributing.md)**: Development standards and workflow.

---

## ⚡ Quick Start (Docker)

Spin up the entire stack with a single command:

```bash
docker-compose up -d --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## ✉️ Support & License
Developed for Murali Sir Projects. Proprietary License. All rights reserved.
