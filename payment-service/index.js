const express = require("express");
const crypto = require("crypto");
const winston = require("winston");

const app = express();
app.use(express.json());

// Structured logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Default 20% failure rate
let failureRate = 0.2;

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.post("/config", (req, res) => {
  failureRate = req.body.failureRate ?? failureRate;
  res.json({ failureRate });
});

app.post("/pay", (req, res) => {
  const traceId = req.headers["x-trace-id"] || crypto.randomUUID();
  const { amount } = req.body;

  const shouldFail = Math.random() < failureRate;

  if (shouldFail) {
    logger.error({
      traceId,
      service: "payment-service",
      event: "payment_failed",
      amount
    });

    return res.status(500).json({
      traceId,
      status: "failed"
    });
  }

  logger.info({
    traceId,
    service: "payment-service",
    event: "payment_success",
    amount
  });

  res.json({
    traceId,
    status: "success",
    transactionId: crypto.randomUUID()
  });
});

app.listen(3001, () => {
  console.log("Payment service running on port 3001");
});
