# Distributed Order Processing System

A containerized microservices demo that models a real-world order workflow with persistence, observability, and failure simulation.

This project is a small distributed system I built to demonstrate how I think about observability, failure handling, and system behavior in production-like environments.

It’s intentionally simple from a business perspective (placing an order), but instrumented the way real systems should be — with metrics, structured logs, trace context propagation, and failure simulation built in from the start.

## Why I Built This

Most demo microservices projects focus on CRUD.

This one focuses on:
- What happens when things fail?
- Can you trace a request across services?
- Can you measure system behavior without attaching a debugger?
- Can you validate outcomes using metrics?
- Can you reproduce failure scenarios deterministically?
- The goal is to show how to make distributed systems observable by design, not as an afterthought.
---

## 🏗 Architecture Overview

Client → Order Service → Payment Service → Notification Service → PostgreSQL

- **Order Service** – Accepts requests and orchestrates downstream calls  
- **Payment Service** – Simulates payment processing with configurable failure rates  
- **Notification Service** – Simulates post-order side effects  
- **PostgreSQL** – Persists order state  

All services are containerized and run locally via Docker Compose.

## Observability Features

### Structured Logging
- JSON logs via Winston
- Correlation / trace ID propagation across services
- Logs structured for ingestion into centralized logging systems

### Metrics
- `/metrics` endpoint in Prometheus format
- Counters for total, successful, and failed orders
- System metrics for runtime visibility
- Enables metric-driven validation of behavior

### Health Endpoints
- `/health` endpoint per service
- Supports readiness/liveness checks and automation hooks

### Failure Simulation
- Configurable payment failure rate
- Enables testing of downstream error handling
- Makes failure paths observable and measurable
- 
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

---

## Where This Could Go Next

If extended further, this system could include:

- OpenTelemetry tracing
- Jaeger visualization
- Retry + exponential backoff
- Circuit breaker patterns
- Contract testing between services
- CI pipeline running integration tests in Docker
- Load testing with metric validation
