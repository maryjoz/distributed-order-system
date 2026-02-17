const express = require("express");
const winston = require("winston");

const app = express();
app.use(express.json());

// Structured logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Optional delay (milliseconds)
let delayMs = 0;

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Endpoint to configure delay
app.post("/config", (req, res) => {
  delayMs = req.body.delayMs ?? delayMs;
  res.json({ delayMs });
});

// Notify endpoint
app.post("/notify", async (req, res) => {
  const { orderId } = req.body;

  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  logger.info({
    service: "notification-service",
    event: "notification_sent",
    orderId
  });

  res.json({
    status: "notification_sent"
  });
});

app.listen(3002, () => {
  console.log("Notification service running on port 3002");
});
