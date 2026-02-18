# Distributed Order Processing System

A containerized microservices demo that models a real-world order workflow with persistence, observability, and failure simulation.

## 🚀 What This Demonstrates

- Service-to-service communication
- Distributed trace ID propagation via headers
- PostgreSQL persistence
- Structured JSON logging
- Prometheus-compatible metrics
- Deterministic failure injection for testing
- Observability validation via end-to-end tests
- Docker-based local orchestration

This project is designed to showcase backend reliability and observability patterns used in production systems.

---

## 🏗 Architecture

**Services:**

- **order-service (3000)**  
  - Accepts orders  
  - Persists state to PostgreSQL  
  - Calls downstream services  
  - Tracks Prometheus metrics  
  - Emits structured logs  
  - Exposes `/health` and `/metrics`

- **payment-service (3001)**  
  - Simulates payment processing  
  - Supports configurable failure rate  
  - Supports deterministic failure via `forceFail` flag  
  - Emits structured logs  

- **notification-service (3002)**  
  - Simulates downstream notification handling  

- **postgres (5432)**  
  - Stores order records  

---

## 🛠 Tech Stack

- Node.js 18  
- Express  
- PostgreSQL  
- Docker & Docker Compose  
- `prom-client` (metrics)  
- Winston (structured logging)  
- Axios (HTTP communication)  
- Playwright (end-to-end observability testing)

---

## 📦 Setup & Run

### Prerequisites

- Docker Desktop installed  
- Docker Compose enabled

Verify:

    docker --version
    docker compose version

---

## 🚀 Build and Run

From the project root:

    docker compose up --build

This will:

- Build all service images  
- Start PostgreSQL  
- Start all microservices  
- Automatically create the `orders` table

Wait until you see:

    Order service running on port 3000

The system will now be available at:

- **Order Service:** http://localhost:3000  
- **Payment Service:** http://localhost:3001  
- **Notification Service:** http://localhost:3002  
- **PostgreSQL:** localhost:5432

---

## 🧪 Usage

### Create an Order

Using curl:

    curl -X POST http://localhost:3000/order \
      -H "Content-Type: application/json" \
      -d '{"amount":100}'

Example response:

    {
      "orderId": "uuid-value",
      "status": "completed"
    }

Payment failures are simulated randomly.

---

### Check Metrics

Open in browser:

    http://localhost:3000/metrics

Example output:

    orders_total 6
    orders_completed_total 4
    orders_failed_total 2

This endpoint also exposes Node.js runtime metrics (CPU, memory, GC, event loop lag).

---

### Health Endpoint

    http://localhost:3000/health

---

## 🗄 Inspect Database

Find the PostgreSQL container:

    docker ps

Connect to the database:

    docker exec -it <container-name> psql -U postgres -d orders

List tables:

    \dt

Query stored orders:

    SELECT id, amount, status FROM orders;

Exit the database:

    \q

---

## 🛑 Stop the System

To stop and remove all containers:

    docker compose down

If persistent volumes are not configured, database data will be removed when the containers are deleted.
