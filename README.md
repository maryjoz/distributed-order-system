# Distributed Order Processing System

A containerized microservices demo that models a real-world order workflow with persistence, observability, and failure simulation.

## 🚀 What This Demonstrates

- Service-to-service communication
- Distributed trace ID propagation
- PostgreSQL persistence
- Retry handling for dependent services
- Structured JSON logging
- Prometheus-compatible metrics
- Docker-based local orchestration

This project is designed to showcase backend reliability and observability patterns used in production systems.

---

## 🏗 Architecture

**Services:**

- **order-service (3000)**  
  Accepts orders, persists state to Postgres, calls downstream services, exposes `/health` and `/metrics`.

- **payment-service (3001)**  
  Simulates payment processing (random failures).

- **notification-service (3002)**  
  Simulates downstream notification handling.

- **postgres (5432)**  
  Stores order records.

---

## 🛠 Tech Stack

- Node.js 18
- Express
- PostgreSQL
- Docker & Docker Compose
- prom-client (metrics)
- Winston (structured logging)
- Axios (HTTP communication)

---

## 📦 Setup & Run

### Prerequisites
- Docker Desktop installed
- Docker Compose enabled

Verify:

```bash
docker --version
docker compose version
