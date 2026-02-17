const express = require("express");
const axios = require("axios");
const winston = require("winston");
const { Pool } = require("pg");
const crypto = require("crypto");
const client = require("prom-client");

const app = express();
app.use(express.json());

// ------------------------
// Metrics (Prometheus) Setup
// ------------------------
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Counters
const ordersTotal = new client.Counter({
  name: "orders_total",
  help: "Total number of orders received"
});

const ordersCompleted = new client.Counter({
  name: "orders_completed_total",
  help: "Total number of completed orders"
});

const ordersFailed = new client.Counter({
  name: "orders_failed_total",
  help: "Total number of failed orders"
});

register.registerMetric(ordersTotal);
register.registerMetric(ordersCompleted);
register.registerMetric(ordersFailed);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ------------------------
// Logger (structured JSON)
// ------------------------
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// ------------------------
// PostgreSQL Connection
// ------------------------
const pool = new Pool({
  host: "postgres",           // Docker service name
  user: "postgres",
  password: "postgres",
  database: "orders",
  port: 5432
});

// Create table if it doesn't exist
async function initializeDatabase() {
  let connected = false;

  while (!connected) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      console.log("Connected to Postgres");

      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY,
          amount INTEGER,
          status TEXT,
          trace_id TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      console.log("Orders table ready");

    } catch (err) {
      console.log("Postgres not ready yet. Retrying in 2 seconds...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

initializeDatabase();


// ------------------------
// Health Endpoint
// ------------------------
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// ------------------------
// Create Order Endpoint
// ------------------------
app.post("/order", async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

const orderId = crypto.randomUUID();
const traceId = crypto.randomUUID();

// increase total orders counter
ordersTotal.inc();

  try {
    // Save initial order (pending)
    await pool.query(
      "INSERT INTO orders (id, amount, status, trace_id) VALUES ($1, $2, $3, $4)",
      [orderId, amount, "pending", traceId]
    );

    logger.info({
      service: "order-service",
      event: "order_created",
      orderId,
      traceId,
      amount
    });

    // ------------------------
    // Call Payment Service
    // ------------------------
    await axios.post(
      "http://payment-service:3001/pay",
      { amount },
      { headers: { "x-trace-id": traceId } }
    );

    // ------------------------
    // Call Notification Service
    // ------------------------
    await axios.post(
      "http://notification-service:3002/notify",
      { orderId },
      { headers: { "x-trace-id": traceId } }
    );

    // Update status to completed
    await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      ["completed", orderId]
    );

    logger.info({
      service: "order-service",
      event: "order_completed",
      orderId,
      traceId
    });

    res.json({
      orderId,
      status: "completed"
    });

    // increase completed orders counter
    ordersCompleted.inc();

  } catch (error) {

    // Update status to failed
    await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      ["failed", orderId]
    );

    logger.error({
      service: "order-service",
      event: "order_failed",
      orderId,
      traceId,
      error: error.message
    });

    res.status(500).json({
      error: "Order failed",
      orderId
    });

    // increase failed orders countercd
    ordersFailed.inc();

  }
});

// ------------------------
// Start Server
// ------------------------
app.listen(3000, "0.0.0.0", () => {
  console.log("Order service running on port 3000");
});
