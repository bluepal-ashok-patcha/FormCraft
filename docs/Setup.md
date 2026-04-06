# Getting Started & Development Setup

Welcome to the **FormCraft** setup guide. This document provides step-by-step instructions to get the application running on your local machine for development and testing.

---

## 📋 Prerequisites

Ensure you have the following installed on your system:
- **Java 17 (LTS)**: JDK 17+ (Amazon Corretto or OpenJDK recommended)
- **Node.js 18+**: For frontend development (uses Vite)
- **Docker & Docker Compose**: To launch the full enterprise stack (PostgreSQL 16, Kafka 7.5, Zookeeper)
- **Maven 3.8+**: If running the backend service locally

---

## 🐳 Containerized Setup (Recommended)

FormCraft is designed to run in containers for absolute consistency. Follow these steps for a one-click setup:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/murali-sir-projects/FormCraft.git
    cd FormCraft
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root directory.
    ```env
    # Database Configuration (Postgres 16)
    SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/formcraft
    SPRING_DATASOURCE_USERNAME=postgres
    SPRING_DATASOURCE_PASSWORD=ashok

    # Infrastructure Logic
    KAFKA_BOOTSTRAP_SERVERS=kafka:9092

    # Third-Party Integrations
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    GEMINI_API_KEY=your_gemini_key
    ```

3.  **Launch the Fleet**:
    ```bash
    docker-compose up -d --build
    ```

---

## 🚀 Deployment Verification (The Production Handshake)

After running `docker-compose`, verify the health of the high-throughput pipeline:

1.  **Check Service Pulse**:
    `docker-compose ps` — Ensure all 5 containers (db, backend, frontend, kafka, zookeeper) are `Up`.
    
2.  **Verify Kafka Connectivity**:
    Check the backend logs for the Kafka connection handshake:
    `docker-compose logs -f backend | grep "ProducerConfig"`
    
3.  **Test the Event Pipeline**:
    Submit a form via the UI or `curl`. If you receive an **HTTP 202 Accepted**, it means Kafka successfully ingested the event.
    Check the database 1 second later to confirm the background worker persisted the data.

---

## 🛠 Manual Development Setup

If you need to debug the code while running the infrastructure in Docker:

1.  **Run Infrastructure Only**:
    ```bash
    docker-compose up -d db zookeeper kafka
    ```
    *Note: Kafka is mapped to `localhost:9093` for host-side development to prevent conflicts with SonarQube.*

2.  **Run Backend Locally**:
    ```bash
    cd formcraft-service
    mvn spring-boot:run
    ```

---

## 🧪 Testing Protocol

### Full Regression Suite
The project uses **Testcontainers** to launch ephemeral Postgres and Kafka instances for 100% fidelity.
```bash
mvn clean test
```

### Async Logic Verification
We use **Awaitility** in our integration tests to validate the millisecond gap between Kafka ingestion and Database persistence. See `FormControllerIntegrationTest.java` for implementation patterns.

---

## 🚩 Troubleshooting

- **Database Health**: If the backend fails, check if Postgres is ready: `docker-compose logs db`.
- **Kafka Port Conflict**: If your local machine has SonarQube or another Kafka instance on `9092`, the system will automatically use **9093** for its host-side connection.
- **Docker Memory**: Kafka/Zookeeper require at least 4GB of RAM assigned to Docker Desktop to run smoothly.

---

## 📧 Support
For architectural deep-dives, refer to [Architecture.md Tuning](./Architecture.md).
