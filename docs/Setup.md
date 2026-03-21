# Getting Started & Development Setup

Welcome to the **FormCraft** setup guide. This document provides step-by-step instructions to get the application running on your local machine for development and testing.

---

## 📋 Prerequisites

Ensure you have the following installed on your system:
- **Java 17 (LTS)**: JDK 17+ (Amazon Corretto or OpenJDK recommended)
- **Node.js 18+**: For frontend development (uses Vite)
- **Docker & Docker Compose**: For containerized orchestration
- **Maven 3.8+**: If running the backend service locally without Docker

---

## 🐳 Containerized Setup (Recommended)

FormCraft is designed to run in containers for consistency across environments. Follow these steps for the fastest setup:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/murali-sir-projects/FormCraft.git
    cd FormCraft
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory (refer to `.env.example` if available).
    ```env
    SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/formcraft
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD=ashok
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    GEMINI_API_KEY=your_gemini_key
    ```

3.  **Run with Docker Compose**:
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the Application**:
    - **Frontend**: `http://localhost:5173`
    - **Backend API**: `http://localhost:8080/api`
    - **Swagger UI**: `http://localhost:8080/swagger-ui.html`

---

## 🛠 Manual Development Setup

If you need to debug specific components, you may want to run services manually.

### 1. Database (PostgreSQL)
If you aren't using Docker for the database, ensure a PostgreSQL 15 instance is running and create a database named `formcraft`.

### 2. Backend Service (Spring Boot)
1.  Navigate to the service directory:
    ```bash
    cd formcraft-service
    ```
2.  Install dependencies:
    ```bash
    ./mvnw clean install
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```

### 3. Frontend Application (React + Vite)
1.  Navigate to the frontend directory:
    ```bash
    cd formcraft-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
The backend uses JUnit 5, Mockito, and Testcontainers for integration testing.
```bash
cd formcraft-service
./mvnw test
```

### Frontend Linting
```bash
cd formcraft-frontend
npm run lint
```

---

## 🚩 Troubleshooting

- **Database Connection**: Ensure the PostgreSQL container is fully healthy before the Spring Boot service starts.
- **CORS Issues**: Check `WebSecurityConfig.java` to ensure `http://localhost:5173` is allowed for cross-origin requests.
- **JWT Errors**: Ensure the `app.jwt-secret` in `application.yml` is at least 256-bit (32 characters).

---

## 📧 Support
For specialized architectural questions, contact the development lead.
